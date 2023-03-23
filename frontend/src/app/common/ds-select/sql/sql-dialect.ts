import { DialectOptions, expandPhrases, sql } from 'sql-formatter';
import alasql from 'alasql';

export const alasqlFunctions = Array.from(
  new Set([
    ...Object.keys((alasql as any).fn).map((str) => str.toUpperCase()),
    ...Object.keys((alasql as any).aggr).map((str) => str.toUpperCase()),
    ...Object.keys((alasql as any).stdfn).map((str) => str.toUpperCase()),
    ...Object.keys((alasql as any).stdlib).map((str) => str.toUpperCase()),

    // user defined
    'MAKE_LINK',
    'JSON_STRINGIFY',
    'JSON_PARSE',
    'SUBTRACT',
    'MAKE_INTERSECTION',
    'MAKE_DIFF',
  ])
);

export const alasqlDialect: DialectOptions = {
  ...sql,
  tokenizerOptions: {
    ...sql.tokenizerOptions,
    reservedFunctionNames: alasqlFunctions,
    operators: [
      ...sql.tokenizerOptions.operators,
      '->',
      '>>',

      // these are here as a workaround for JSON queries
      '@{',
      '}',
      ':',
      '{',
      '@[',
      ']',
      ':@[',
      ':{',
    ],
  },
};
