export const diffMeta = Symbol('makeDiff meta');

export function makeDiff(value: any, diffId = 0) {
  if (value === null || value === undefined) return value;

  value[diffMeta] = diffId;
  return value;
}
