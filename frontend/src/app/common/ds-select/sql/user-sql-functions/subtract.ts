import { difference, clone } from 'lodash-es';
import { isPrimitive } from 'src/app/utils/is-primitive';

/**
 * treats arrays as unordered sets
 */
export function subtract(a: any, b: any) {
  if (b === null || b === undefined) return a;

  if (isPrimitive(a) && isPrimitive(b)) {
    return a === b ? null : a;
  }
  if (isPrimitive(a) || isPrimitive(b)) {
    return a;
  }
  if (a instanceof Array && b instanceof Array) {
    return difference(a, b);
  }

  a = clone(a); // copy - we don't want to pollute the original data
  for (const bKey in b) {
    if (!Object.prototype.hasOwnProperty.call(b, bKey)) {
      continue;
    }

    const keyDiff = subtract(a[bKey], b[bKey]);
    if (keyDiff === null) {
      delete a[bKey];
    } else {
      a[bKey] = keyDiff;
    }
  }
  return a;
}
