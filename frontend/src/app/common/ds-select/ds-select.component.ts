import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  map,
  merge,
  retry,
  skip,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { State } from 'src/app/store/reducers/';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import alasql from 'alasql';
import { subtract } from './sql/user-sql-functions/subtract';
import {
  AggregationStage,
  makeIntersection,
} from './sql/user-sql-functions/make-intersection';
import { diffMeta } from './sql/user-sql-functions/make-diff';
import { ALASQL } from './sql/alasql';
import { Ads } from 'src/app/store/reducers/ads.reducer';
import { ColSortService, SortColumn } from './ds-table/col-sort.service';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { isPrimitive } from 'src/app/utils/is-primitive';

type dataToDiff = Record<string, { [diffMeta]?: number }>[];
interface ASTExpression {
  toString: () => string;
  as?: string;
}

@Component({
  selector: 'mozaik-ds-select',
  templateUrl: './ds-select.component.html',
  styleUrls: ['./ds-select.component.scss'],
})
export class DsSelectComponent
  extends UnsubscribingComponent
  implements OnInit
{
  querySubj = new BehaviorSubject<string>(
    'SELECT MAKE_LINK(`index`) link, algorithm, stimulus FROM data'
  );

  ads$ = this.store.select((x) => x.ads.allAds);
  path$ = this.store.select(routerSelectors.selectRouteParam('path'));
  sqlres$ = this.querySQL();

  error = '';

  constructor(
    private store: Store<State>,
    @Inject(ALASQL) private sql: typeof alasql,
    private colSortS: ColSortService
  ) {
    super();
  }

  ngOnInit(): void {
    this.colSortS.sortChangedFromTemplate$
      .pipe(
        filter((x) => !!x),
        takeUntil(this.onDestroy$)
      )
      .subscribe((sort) => {
        const ast: any = this.sql.parse(this.querySubj.value);
        const lastStatement = ast.statements[ast.statements.length - 1];
        ast.statements[ast.statements.length - 1] = this.addOrderBy(
          lastStatement,
          sort
        );
        ast.statements.forEach((s: any) => this.escapeColumns(s));

        this.querySubj.next(ast.toString());
      });
  }

  private computeDiff(data: dataToDiff) {
    if (!data.length) return;
    const cols = Object.keys(data[0]);

    cols.forEach((col) => {
      const interMap = this.computeColIntersection(col, data);
      if (interMap.size) {
        this.subtractFromCol(col, interMap, data);
      }
    });
  }

  private computeColIntersection(col: string, data: dataToDiff) {
    const interMap = new Map<number, any>();
    data.forEach((row) => {
      if (row[col][diffMeta] !== undefined) {
        const diffId = row[col][diffMeta];

        if (!interMap.has(diffId)) {
          interMap.set(
            diffId,
            makeIntersection(row[col], null, AggregationStage.init)
          );
        } else {
          interMap.set(
            diffId,
            makeIntersection(
              row[col],
              interMap.get(diffId),
              AggregationStage.step
            )
          );
        }
      }
    });

    interMap.forEach((acc, id) =>
      interMap.set(
        id,
        makeIntersection(undefined, acc, AggregationStage.finalize)
      )
    );
    return interMap;
  }

  private subtractFromCol(
    col: string,
    subtrahends: Map<number, any>,
    data: dataToDiff
  ) {
    data.forEach((row) => {
      if (row[col][diffMeta] !== undefined) {
        row[col] = subtract(row[col], subtrahends.get(row[col][diffMeta]));
        delete row[col][diffMeta];
      }
    });
  }

  private querySQL() {
    return this.ads$.pipe(
      tap((data) => this.initDataSource(data)),
      combineLatestWith(this.querySubj),
      map(([data, query]) => {
        const ast: any = this.sql.parse(query);
        const lastStatement = ast.statements[ast.statements.length - 1];

        this.colSortS.setSortColumn(
          this.extractSortColumn(lastStatement),
          false
        );

        let results: any[] = this.sql(query);
        if (ast.statements.length > 1) {
          results = results.pop();
        }

        if (query.match(/\bmake_diff\(/i)) {
          this.computeDiff(results);
        }
        return results;
      }),
      retry({
        delay: (error) => {
          console.error(error);
          this.error = error;
          return this.querySubj.pipe(skip(1));
        },
      }),
      tap(() => (this.error = ''))
    );
  }

  private initDataSource(data: Ads[]) {
    this.sql(
      `
  DROP TABLE IF EXISTS data;
  CREATE TABLE data (
    \`index\` INT PRIMARY KEY,
    algorithm STRING,
    identifier STRING,
    neuron INT,
    period INT,
    sheet STRING,
    stimulus JSON,
    tags JSON,
    unit STRING,
    valueName STRING
  );
  INSERT INTO data SELECT * FROM ?
  `,
      [data]
    );
  }

  private addOrderBy(statement: any, sort: SortColumn): any {
    const constructors = this.getASTConstructors();
    if (
      statement.union ||
      statement.unionall ||
      statement.except ||
      statement.intersect
    ) {
      // we need to wrap this in subquery because alasql is buggy
      const wrapper = new constructors.statement();
      const star = new constructors.column();
      star.columnid = '*';
      wrapper.columns = [star];
      wrapper.from = statement;
      statement = wrapper;
    }

    const orderAST: any = this.sql.parse(
      `SELECT * FROM a ORDER BY ${sort.key} ${sort.asc ? 'ASC' : 'DESC'}`
    );
    statement.order = orderAST.statements[0].order;
    return statement;
  }

  private extractSortColumn(statement: any): SortColumn {
    const orderClause: {
      expression: ASTExpression;
      direction: 'ASC' | 'DESC';
    } = statement.order?.[0];
    if (orderClause) {
      const colExpr = orderClause.expression.toString();
      const matchingColumn = (statement.columns as ASTExpression[]).find(
        (col) => col.toString() == colExpr
      );
      return {
        key: matchingColumn?.as || colExpr,
        asc: orderClause.direction == 'ASC',
      };
    }
    return null;
  }

  private getASTConstructors() {
    const ast: any = this.sql.parse('SELECT a FROM data ORDER BY a');
    return {
      statement: ast.statements[0].constructor,
      column: ast.statements[0].columns[0].constructor,
      order: ast.statements[0].order[0].constructor,
      orderExpr: ast.statements[0].order[0].expression.constructor,
    };
  }

  private escapeColumns(statement: any) {
    if (isPrimitive(statement)) return;

    if (statement.columnid) {
      statement.columnid = '`' + statement.columnid + '`';
    }

    for (const key in statement) {
      if (Object.prototype.hasOwnProperty.call(statement, key)) {
        const element = statement[key];

        if (element instanceof Array) {
          element.forEach((val: any) => this.escapeColumns(val));
        } else {
          this.escapeColumns(element);
        }
      }
    }
  }

  /**
   * template sql editor event handler
   */
  onQuery(query: string) {
    this.colSortS.setSortColumn(null, false);
    this.querySubj.next(query);
  }
}
