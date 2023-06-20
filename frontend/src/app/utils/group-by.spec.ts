import { groupBy } from './group-by';

describe('groupBy', () => {
  it('should group based on iterated elements', () => {
    expect(groupBy([1, 4, 8, 10, 3, -2, 0, 17], (val) => val % 3)).toEqual([
      [1, 4, 10],
      [8, 17],
      [3, 0],
      [-2],
    ]);
  });
  it('should group based on indices', () => {
    expect(groupBy([1, 4, 8, 10, 3, -2, 0, 17], (val, i) => i % 3)).toEqual([
      [1, 10, 0],
      [4, 3, 17],
      [8, -2],
    ]);
  });
  it('should work with other iterables', () => {
    expect(
      groupBy(new Set([1, 4, 8, 10, 3, -2, 0, 17]), (val, i) => (val + i) % 3)
    ).toEqual([[1, 8, 10, 3], [4], [-2, 0, 17]]);
  });
});
