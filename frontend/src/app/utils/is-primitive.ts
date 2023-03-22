export function isPrimitive(value: any) {
  return !value || ['number', 'string', 'boolean'].includes(typeof value);
}
