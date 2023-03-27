import { clone } from 'lodash-es';

export const diffMeta = Symbol('makeDiff meta');

export function makeDiff(value: any, diffId = 0) {
  if (value === null || value === undefined) return value;

  const res = clone(value);
  res[diffMeta] = diffId;
  return res;
}
