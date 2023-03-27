import { intersection, clone } from 'lodash-es';
import { isPrimitive } from 'src/app/utils/is-primitive';

export enum AggregationStage {
  init = 1,
  step = 2,
  finalize = 3,
}

/**
 * treats arrays as unordered sets
 */
export function makeIntersection(val: any, acc: any, stage: AggregationStage) {
  if (stage == AggregationStage.init) {
    return clone(val);
  }
  if (stage == AggregationStage.step) {
    if (isPrimitive(val) && isPrimitive(acc)) {
      if (val === acc) return val;
      return null;
    }

    if (isPrimitive(val) || isPrimitive(acc)) {
      return null;
    }
    if (val instanceof Array && acc instanceof Array) {
      return intersection(val, acc);
    }

    for (const accKey in acc) {
      if (!Object.prototype.hasOwnProperty.call(acc, accKey)) {
        continue;
      }

      const keyInters = makeIntersection(
        val[accKey],
        acc[accKey],
        AggregationStage.step
      );
      if (keyInters === null && acc[accKey] !== null) {
        delete acc[accKey];
      } else {
        acc[accKey] = keyInters;
      }
    }
  }
  return acc;
}
