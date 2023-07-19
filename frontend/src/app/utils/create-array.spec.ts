import { createArray } from './create-array';

describe('createArray', () => {
  it('should create a 1d array', () => {
    const arr = createArray([5]);
    expect(arr).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('should create a 2d array', () => {
    const arr = createArray([3, 5]);
    expect(arr).toEqual([
      [undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined],
    ]);
  });

  it('should create a 3d array', () => {
    const arr = createArray([2, 3, 5]);
    expect(arr).toEqual([
      [
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
      ],
      [
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
      ],
    ]);
  });
});
