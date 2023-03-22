import { isPrimitive } from './is-primitive';

export function flattenObject(obj: Record<string | number, any>) {
  const flat: Record<string, string | number | boolean | any[]> = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    if (isPrimitive(obj[key])) {
      flat[key] = obj[key];
    } else if (obj[key] instanceof Array) {
      flat[key] = (obj[key] as any[]).map((val) =>
        typeof val == 'object' && val !== null ? flattenObject(val) : val
      );
    } else {
      const nested = flattenObject(obj[key]);
      for (const nestedKey in nested) {
        flat[`${key}.${nestedKey}`] = nested[nestedKey];
      }
    }
  }

  return flat;
}
