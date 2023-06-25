import * as alasql from 'alasql';
import { isPrimitive } from 'src/app/utils/is-primitive';
import { formatDialect } from 'sql-formatter';
import { alasqlDialect } from './sql-dialect';
import { SortColumn } from 'src/app/store/actions/navigator.actions';
import { Injectable } from '@angular/core';

interface AST {
  statements: ASTSelectStatement[];
}

interface ASTAliasable {
  toString: () => string;
  as?: string;
}

interface ASTTable extends ASTAliasable {
  tableid: string;
}

interface ASTExpressionWrapper {
  expression: ASTExpression;
}

interface ASTLiteral extends ASTAliasable {
  value: any;
}

interface ASTFunction extends ASTAliasable {
  funcid: string;
  args: ASTExpression[];
}

interface ASTColumn extends ASTAliasable {
  columnid: string;
  tableid?: string;
}

interface ASTAggregator extends ASTAliasable, ASTExpressionWrapper {
  aggregatorid: string;
  /**
   * not yet fully supported in alasql, bound to change
   */
  over?: any;
}

interface ASTUnaryOp extends ASTAliasable {
  /**
   * for some reason, alasql uses unary op with no operator
   * for group by items (most likely a bug)
   */
  op?: string;
  right: ASTSubExpr;
}
interface ASTBinaryOp extends ASTAliasable {
  left: ASTSubExpr;
  op: string;
  right: ASTSubExpr;
}
interface ASTTernaryOp extends ASTAliasable {
  left: ASTSubExpr;
  op: string;
  right1: ASTSubExpr;
  right2: ASTSubExpr;
}

/**
 * for n-ary expressions
 */
type ASTSubExpr = ASTExpression | ASTExpression[] | string;

interface ASTOrderClause extends ASTExpressionWrapper {
  direction: 'ASC' | 'DESC';
}

interface ASTJoin {
  joinmode?: string;
  applymode?: string;
  table?: ASTTable;
  select?: ASTSelectStatement;
  on?: ASTExpression;
  using?: ASTExpression[];
}

interface ASTGrouper {
  type: 'GROUPING SETS' | 'ROLLUP' | 'CUBE';
  group: ASTExpression[];
}

type ASTExpression =
  | ASTSelectStatement
  | ASTLiteral
  | ASTFunction
  | ASTColumn
  | ASTAggregator
  | ASTUnaryOp
  | ASTBinaryOp
  | ASTTernaryOp;

/**
 * actual types are probably more strict
 */
interface ASTSelectStatement extends ASTAliasable {
  columns: ASTExpression[];
  from?: (ASTSelectStatement | ASTTable)[];
  group?: (ASTExpression | ASTGrouper)[];
  having?: ASTExpression;
  order?: ASTOrderClause[];
  where?: ASTExpressionWrapper;
  union?: ASTSelectStatement;
  unionall?: ASTSelectStatement;
  except?: ASTSelectStatement;
  intersect?: ASTSelectStatement;
  limit?: ASTLiteral;
  offset?: ASTLiteral;
  top?: ASTLiteral;
  joins?: ASTJoin[];
}

/**
 * helps with testing
 */
@Injectable({ providedIn: 'root' })
export class SQLBuilderFactory {
  public create(initialStatement: string) {
    return new SQLBuilder(initialStatement);
  }
}

/**
 * Affects last provided statement only
 */
export class SQLBuilder {
  private stmt: ASTSelectStatement;
  private ast: AST;
  private parser: { parse: (query: string) => AST } = alasql as any;
  private constructors = this.getASTConstructors();

  public get statements(): number {
    return this.ast.statements.length;
  }

  constructor(initialStatement: string) {
    this.ast = this.parser.parse(initialStatement);
    this.stmt = this.ast.statements[this.ast.statements.length - 1];
  }

  private getASTConstructors() {
    const ast: any = this.parser.parse(
      'SELECT a FROM data WHERE a AND a = a GROUP BY a HAVING a ORDER BY a'
    );
    return {
      select: ast.statements[0].constructor,
      column: ast.statements[0].columns[0].constructor,
      where: ast.statements[0].where.constructor,
      having: ast.statements[0].having.constructor,
      binaryOp: ast.statements[0].where.expression.constructor,
      order: ast.statements[0].order[0].constructor,
      orderExpr: ast.statements[0].order[0].expression.constructor,
    };
  }

  public orderBy(sort: SortColumn): this {
    if (this.hasSetOperation()) {
      // we need to wrap this in subquery because alasql is buggy
      this.wrap();
    }

    const orderAST = this.parser.parse(
      `SELECT * FROM a ORDER BY \`${sort.key}\` ${sort.asc ? 'ASC' : 'DESC'}`
    );
    this.stmt.order = orderAST.statements[0].order;
    return this;
  }

  public extractSortColumn(): SortColumn {
    const orderClause = this.stmt.order?.[0];
    if (orderClause) {
      const colExpr = orderClause.expression.toString();
      const matchingColumn = this.stmt.columns.find(
        (col) => col.toString() == colExpr
      );
      return {
        key: matchingColumn?.as || colExpr,
        asc: orderClause.direction == 'ASC',
      };
    }
    return null;
  }

  public getColumnNames() {
    return this.stmt.columns.map(
      (col) => col.as || Stringifier.handleExpression(col, { escape: false })
    );
  }

  /**
   * Columns can be either table column names or expressions. This escapes all column names in such expression.
   * @param columnExpr column returned by current statement. This should not be escaped in any way.
   */
  public escapeColumn(columnExpr: string) {
    const column = this.stmt.columns.find(
      (col) =>
        (col.as || Stringifier.handleExpression(col, { escape: false })) ==
        columnExpr
    );
    return Stringifier.handleExpression(column);
  }

  public toString() {
    return this.ast.statements
      .map((s) => Stringifier.handleStatement(s))
      .join('; ');
  }

  public toFormattedString() {
    const str = this.toString();
    return formatDialect(str, {
      dialect: alasqlDialect,
      keywordCase: 'upper',
    });
  }

  public andHaving(condition: string): this {
    this.addCondition(condition, 'having');

    return this;
  }

  public andWhere(condition: string): this {
    this.addCondition(condition, 'where');

    return this;
  }

  private addCondition(condition: string, type: 'where' | 'having') {
    if (this.hasSetOperation()) {
      this.wrap();
    }

    const parsed = this.parser.parse(
      `SELECT * FROM a ${type.toUpperCase()} ${condition}`
    );
    if (!this.stmt[type]) {
      this.stmt[type] = parsed.statements[0][type] as any;
      return this;
    }

    let junction: ASTBinaryOp = null,
      currExpr = type == 'where' ? this.stmt[type].expression : this.stmt[type];
    let logical = ['AND', 'NOT', 'OR'];
    while (logical.includes((currExpr as ASTBinaryOp).op)) {
      junction = currExpr as ASTBinaryOp;
      currExpr = junction.right as ASTExpression;
    }

    const andExpr: ASTBinaryOp = new this.constructors.binaryOp();
    andExpr.op = 'AND';
    andExpr.left = currExpr;
    andExpr.right = parsed.statements[0].where.expression;
    if (junction === null) {
      if (type == 'where') this.stmt[type].expression = andExpr;
      else this.stmt[type] = andExpr;
    } else {
      junction.right = andExpr;
    }

    return this;
  }

  public wrap(): this {
    const wrapper: ASTSelectStatement = new this.constructors.select();
    const star = new this.constructors.column();
    star.columnid = '*';
    wrapper.columns = [star];
    wrapper.from = [this.stmt];
    this.stmt = wrapper;
    return this;
  }

  public getAggregatedCols() {
    return this.stmt.columns
      .filter((col) => 'aggregatorid' in col)
      .map(
        (col) => col.as || Stringifier.handleAggregator(col as ASTAggregator)
      );
  }

  private hasSetOperation() {
    return !!(
      this.stmt.union ||
      this.stmt.unionall ||
      this.stmt.except ||
      this.stmt.intersect
    );
  }

  static escapeValue(val: any): string {
    if (val === null || val === undefined) {
      return 'NULL';
    }
    if (typeof val == 'boolean') {
      return val.toString().toUpperCase();
    }
    if (typeof val == 'number') return val + '';
    if (typeof val == 'string') return `'${this.sanitizeStr(val)}'`;
    if (val instanceof Array) {
      return '@[' + val.map((x) => this.escapeValue(x)).join(', ') + ']';
    }
    if (val.prototype === Object) {
      return (
        '@{' +
        Object.entries(val).map(
          ([k, v]) => this.escapeValue(k) + ': ' + this.escapeValue(v)
        ) +
        '}'
      );
    }
    return '(' + Stringifier.handleExpression(val) + ')';
  }

  static sanitizeStr(str: string) {
    return str.replace(/\\'\[\]_%/, '\\$0');
  }
}

/**
 * this right here would be a perfect use case for visitor.
 * Unfortunately, we cannot really mess with the alasql internal classes
 */
class Stringifier {
  public static handleStatement(
    stmt: ASTSelectStatement,
    options: { toplv?: boolean; escape?: boolean } = {}
  ): string {
    options = { toplv: true, escape: true, ...options };
    let res = 'SELECT ';
    if (stmt.top) {
      res += 'TOP ' + this.handleLiteral(stmt.top, options.escape) + ' ';
    }

    res += stmt.columns
      .map((col) => this.handleExpression(col, { escape: options.escape }))
      .join(', ');
    if (stmt.from) {
      res +=
        ' FROM ' +
        stmt.from
          .map((x) => {
            if ('tableid' in x) return this.handleTable(x, options.escape);
            return this.handleStatement(x, { ...options, toplv: false });
          })
          .join(', ');
    }
    if (stmt.joins) {
      res +=
        ' ' +
        stmt.joins
          .map((j) => this.handleApplyJoin(j, options.escape))
          .join(', ');
    }

    if (stmt.where) {
      res +=
        ' WHERE ' +
        this.handleExpression(stmt.where.expression, {
          escape: options.escape,
        });
    }
    if (stmt.group) {
      res +=
        ' GROUP BY ' +
        stmt.group
          .map((x) =>
            'type' in x
              ? this.handleGrouper(x, options.escape)
              : this.handleExpression(x, { escape: options.escape })
          )
          .join(', ');
    }
    if (stmt.having) {
      res +=
        ' HAVING ' +
        this.handleExpression(stmt.having, { escape: options.escape });
    }

    if (stmt.order) {
      res +=
        ' ORDER BY ' +
        stmt.order.map((x) => this.handleOrder(x, options.escape)).join(', ');
    }

    if (stmt.limit) {
      res += ' LIMIT ' + this.handleLiteral(stmt.limit, options.escape);
    }
    if (stmt.offset) {
      res += ' OFFSET ' + this.handleLiteral(stmt.limit, options.escape);
    }

    if (stmt.union) {
      res += ' UNION ' + this.handleStatement(stmt.union, options);
    }
    if (stmt.unionall) {
      res += ' UNION ALL ' + this.handleStatement(stmt.unionall, options);
    }
    if (stmt.intersect) {
      res += ' INTERSECT ' + this.handleStatement(stmt.intersect, options);
    }
    if (stmt.except) {
      res += ' EXCEPT ' + this.handleStatement(stmt.except, options);
    }

    if (!options.toplv) {
      return this.addAlias('(' + res + ')', stmt, options.escape);
    }
    return res;
  }

  public static handleExpression(
    expr: ASTExpression,
    options: { jsPropAccess?: boolean; escape?: boolean } = {}
  ): string {
    options = { jsPropAccess: false, escape: true, ...options };

    if ('value' in expr) return this.handleLiteral(expr, options.escape);
    if ('funcid' in expr)
      return this.handleFunction(expr, {
        isJSFn: options.jsPropAccess,
        escape: options.escape,
      });
    if ('columnid' in expr) return this.handleColumn(expr, options.escape);
    if ('aggregatorid' in expr)
      return this.handleAggregator(expr, options.escape);
    if ('right' in expr && !('left' in expr))
      return this.handleUnaryOp(expr, options.escape);
    if ('right' in expr) return this.handleBinaryOp(expr, options.escape);
    if ('right1' in expr) return this.handleTernaryOp(expr, options.escape);
    if ('columns' in expr)
      return this.handleStatement(expr, {
        toplv: false,
        escape: options.escape,
      });
    return (expr as any).toString();
  }

  public static handleLiteral(lit: ASTLiteral, escape = true): string {
    const val = SQLBuilder.escapeValue(lit.value);
    return this.addAlias(val, lit, escape);
  }

  public static handleFunction(
    fn: ASTFunction,
    options: { isJSFn?: boolean; escape?: boolean } = {}
  ): string {
    options = { isJSFn: false, escape: true, ...options };

    const quo = options.escape ? '`' : '';
    let val = options.isJSFn ? quo + fn.funcid + quo : fn.funcid.toUpperCase();
    val +=
      '(' +
      (fn.args || [])
        .map((arg) => this.handleExpression(arg, { escape: options.escape }))
        .join(', ') +
      ')';
    return this.addAlias(val, fn, options.escape);
  }

  public static handleAggregator(agg: ASTAggregator, escape = false): string {
    const val = `${agg.aggregatorid}(${this.handleExpression(agg.expression, {
      escape,
    })})`;
    return this.addAlias(val, agg, escape);
  }

  public static handleColumn(col: ASTColumn, escape = true): string {
    let val = col.columnid;
    if (val != '*' && escape) val = '`' + val + '`';
    if (col.tableid)
      val = escape ? '`' + col.tableid + '`.' + val : col.tableid + '.' + val;
    return this.addAlias(val, col, escape);
  }

  public static handleUnaryOp(op: ASTUnaryOp, escape = true): string {
    let val = op.op ? '' : op.op + ' ';
    val += this.handleSubExpr(op.right, op.op, false, escape);
    return this.addAlias(val, op, escape);
  }

  public static handleBinaryOp(op: ASTBinaryOp, escape = true): string {
    let val = op.op == '->' ? op.op : ' ' + op.op + ' ';
    val = this.handleSubExpr(op.left, op.op, true, escape) + val;
    val += this.handleSubExpr(op.right, op.op, false, escape);
    return this.addAlias(val, op, escape);
  }

  public static handleTernaryOp(op: ASTTernaryOp, escape = true): string {
    let val = ' ' + op.op + ' ';
    val = this.handleSubExpr(op.left, op.op, true, escape) + val;
    val += this.handleSubExpr(op.right1, op.op, false, escape);
    val += ' AND ' + this.handleSubExpr(op.right2, op.op, false, escape);
    return this.addAlias(val, op, escape);
  }

  private static addAlias(
    value: string,
    alias: ASTAliasable,
    escape = true
  ): string {
    if (alias.as) {
      return value + (escape ? ` \`${alias.as}\`` : ' ' + alias.as);
    }
    return value;
  }

  /**
   * for expressions in n-ary operations
   * where it might be neccessary to add parentheses
   * @param sub subexpression
   * @param op operator joining the subexpressions
   * @param left is the subexpression on the left side of the operator
   */
  private static handleSubExpr(
    sub: ASTSubExpr,
    op: string,
    left: boolean,
    escape = true
  ): string {
    if (sub instanceof Array) {
      return (
        '(' +
        sub.map((x) => this.handleExpression(x, { escape })).join(', ') +
        ')'
      );
    }
    if (typeof sub == 'string') {
      return escape ? '`' + sub + '`' : sub;
    }
    if ('left' in sub && (op != '->' || !left)) {
      return '(' + this.handleExpression(sub, { escape }) + ')';
    }
    return this.handleExpression(sub, {
      jsPropAccess: op == '->' && !left,
      escape,
    });
  }

  public static handleTable(table: ASTTable, escape = true): string {
    const val = escape ? '`' + table.tableid + '`' : table.tableid;
    return this.addAlias(val, table, escape);
  }

  public static handleApplyJoin(join: ASTJoin, escape = true): string {
    let res = join.joinmode
      ? join.joinmode + ' JOIN '
      : join.applymode + ' APPLY ';
    if (join.select)
      res += this.handleStatement(join.select, { toplv: false, escape });
    if (join.table) res += this.handleTable(join.table, escape);
    if (join.using) {
      res +=
        ' USING ' +
        join.using.map((x) => this.handleExpression(x, { escape })).join(', ');
    }
    if (join.on) {
      res += ' ON ' + this.handleExpression(join.on, { escape });
    }
    return res;
  }

  public static handleGrouper(grouper: ASTGrouper, escape = true): string {
    return (
      grouper.type +
      '(' +
      grouper.group
        .map((x) => this.handleExpression(x, { escape }))
        .join(', ') +
      ')'
    );
  }

  public static handleOrder(order: ASTOrderClause, escape = true): string {
    return (
      this.handleExpression(order.expression, { escape }) +
      ' ' +
      order.direction
    );
  }
}
