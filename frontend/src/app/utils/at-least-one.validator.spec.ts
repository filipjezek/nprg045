import { AbstractControl, ValidatorFn } from '@angular/forms';
import { atLeastOneValidator } from './at-least-one.validator';

describe('atLeastOneValidator', () => {
  it('should validate form arrays', () => {
    const control: AbstractControl = {
      controls: [{ value: null }, { value: 34 }, { value: null }],
    } as any;

    expect(atLeastOneValidator()(control)).toBe(null);
    expect(atLeastOneValidator(/0|1/)(control)).toBe(null);
    expect(atLeastOneValidator(/0|2/)(control)).toBeTruthy();
  });

  it('should validate form groups', () => {
    const control: AbstractControl = {
      controls: {
        foo: { value: null },
        bar: { value: 34 },
        baz: { value: null },
      },
    } as any;

    expect(atLeastOneValidator()(control)).toBe(null);
    expect(atLeastOneValidator(/foo|bar/)(control)).toBe(null);
    expect(atLeastOneValidator(/foo|baz/)(control)).toBeTruthy();
  });
});
