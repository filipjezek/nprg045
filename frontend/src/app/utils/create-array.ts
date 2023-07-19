export function createArray(dimensions: number[]) {
  const length = dimensions[0];
  const result = new Array(length);
  if (dimensions.length > 1) {
    const inner = dimensions.slice(1);
    for (let i = 0; i < length; ++i) {
      result[i] = createArray(inner);
    }
  }
  return result;
}
