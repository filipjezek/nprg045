import { InjectionToken } from '@angular/core';
import { formatDialect } from 'sql-formatter';
import { alasqlDialect } from './sql-dialect';

/**
 * when DI is not available (reducers), use this
 */
export const formatterImplementation = (sql: string) =>
  formatDialect(sql, {
    dialect: alasqlDialect,
    keywordCase: 'upper',
  });

/**
 * for better testability
 */
export const FORMAT_SQL = new InjectionToken('format sql', {
  providedIn: 'root',
  factory: () => formatterImplementation,
});
