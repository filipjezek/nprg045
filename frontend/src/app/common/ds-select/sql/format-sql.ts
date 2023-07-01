import { InjectionToken } from '@angular/core';
import { formatDialect } from 'sql-formatter';
import { alasqlDialect } from './sql-dialect';

export const FORMAT_SQL = new InjectionToken('format sql', {
  providedIn: 'root',
  factory: () => (sql: string) =>
    formatDialect(sql, {
      dialect: alasqlDialect,
      keywordCase: 'upper',
    }),
});
