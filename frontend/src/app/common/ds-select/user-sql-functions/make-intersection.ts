import {} from 'lodash-es';

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
    return val;
  }
  if (stage == AggregationStage.step) {
  }
  return acc;
}
