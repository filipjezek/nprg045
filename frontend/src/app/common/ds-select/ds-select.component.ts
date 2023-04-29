import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatestWith,
  map,
  retry,
  shareReplay,
  skip,
  takeUntil,
  tap,
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
import { SQLBuilder } from './sql/sql-builder';
import { changeQuery } from 'src/app/store/actions/navigator.actions';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';

type dataToDiff = { [diffMeta]?: number }[][];

@Component({
  selector: 'mozaik-ds-select',
  templateUrl: './ds-select.component.html',
  styleUrls: ['./ds-select.component.scss'],
})
export class DsSelectComponent
  extends UnsubscribingComponent
  implements OnInit, OnDestroy
{
  query$ = this.store.select((x) => x.navigator.query);

  ads$ = this.store.select((x) => x.ads.allAds);
  path$ = this.store.select(routerSelectors.selectRouteParam('path'));
  sqlres$ = this.querySQL();

  error = '';

  constructor(
    private store: Store<State>,
    @Inject(ALASQL) private sql: typeof alasql
  ) {
    super();
  }

  ngOnInit(): void {}

  private computeDiff(data: dataToDiff) {
    if (!data.length) return;

    for (let col = 0; col < data[0].length; col++) {
      const interMap = this.computeColIntersection(col, data);
      if (interMap.size) {
        this.subtractFromCol(col, interMap, data);
      }
    }
  }

  private computeColIntersection(col: number, data: dataToDiff) {
    const interMap = new Map<number, any>();
    data.forEach((row) => {
      if (row[col]?.[diffMeta] !== undefined) {
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
    col: number,
    subtrahends: Map<number, any>,
    data: dataToDiff
  ) {
    data.forEach((row) => {
      if (row[col]?.[diffMeta] !== undefined) {
        row[col] = subtract(row[col], subtrahends.get(row[col][diffMeta]));
      }
    });
  }

  private querySQL() {
    return this.ads$.pipe(
      tap((data) => this.initDataSource(data)),
      combineLatestWith(this.query$),
      map(([data, query]) => {
        const builder = new SQLBuilder(query);

        let results: any[][] = this.sql(query);
        if (builder.statements > 1) {
          results = results.pop();
        }

        if (query.match(/\bmake_diff\(/i)) {
          this.computeDiff(results);
        }
        return { results, keys: builder.getColumnNames() };
      }),
      retry({
        delay: (error) => {
          console.error(error);
          this.error = error;
          return this.query$.pipe(skip(1));
        },
      }),
      tap(() => (this.error = '')),
      takeUntil(this.onDestroy$),
      shareReplay(1)
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

  /**
   * template sql editor event handler
   */
  onQuery(query: string) {
    this.store.dispatch(changeQuery({ query }));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.sql(`DROP TABLE data`);
  }
}
