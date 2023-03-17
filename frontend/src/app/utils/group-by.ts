export function groupBy<T>(
  collection: Iterable<T>,
  grouper: (val: T, index: number) => any
): T[][] {
  const map = new Map<any, T[]>();
  let i = 0;
  for (const item of collection) {
    const key = grouper(item, i);
    if (map.has(key)) {
      map.get(key).push(item);
    } else {
      map.set(key, [item]);
    }
    i++;
  }

  return Array.from(map.values());
}
