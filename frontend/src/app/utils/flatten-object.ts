import { isPrimitive } from './is-primitive';

export function flattenObject(obj: any): any {
  if (isPrimitive(obj)) return obj;
  if (obj instanceof Array) return obj.map((x) => flattenObject(x));

  const flat: Record<string, string | number | boolean | any[]> = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    if (isPrimitive(obj[key])) {
      flat[key] = obj[key];
    } else if (obj[key] instanceof Array) {
      flat[key] = flattenObject(obj[key]);
    } else {
      const nested = flattenObject(obj[key]);
      for (const nestedKey in nested) {
        flat[`${key}.${nestedKey}`] = nested[nestedKey];
      }
    }
  }

  return flat;
}
