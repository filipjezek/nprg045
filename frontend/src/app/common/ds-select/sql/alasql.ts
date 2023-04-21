import { InjectionToken } from '@angular/core';
import alasql from 'alasql';
import { makeDiff } from './user-sql-functions/make-diff';
import { makeIntersection } from './user-sql-functions/make-intersection';
import { makeLink } from './user-sql-functions/make-link';
import { subtract } from './user-sql-functions/subtract';
import * as stableStringify from 'json-stable-stringify';

export const ALASQL = new InjectionToken<typeof alasql>('alasql', {
  factory: () => {
    addUserFunctions();
    alasql.options.modifier = 'MATRIX';
    return alasql;
  },
});

function addUserFunctions() {
  alasql.fn['MAKE_LINK'] = makeLink;
  alasql.fn['JSON_STRINGIFY'] = stableStringify;
  alasql.fn['JSON_PARSE'] = (
    val,
    reviver?: (this: any, key: string, value: any) => any
  ) => {
    if (val === undefined || val === null) return val;
    if (val == 'undefined') return undefined;
    return JSON.parse(val, reviver);
  };
  alasql.fn['SUBTRACT'] = subtract;
  alasql.aggr['MAKE_INTERSECTION'] = makeIntersection;
  alasql.fn['MAKE_DIFF'] = makeDiff;
}
