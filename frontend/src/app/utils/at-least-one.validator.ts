import {
  ValidatorFn,
  FormGroup,
  AbstractControl,
  FormArray,
} from '@angular/forms';

export function atLeastOneValidator(r?: RegExp): ValidatorFn {
  return (controlGroup: AbstractControl) => {
    const controls: Record<string | number, AbstractControl> = (
      controlGroup as FormGroup | FormArray
    ).controls as any;
    if (controls) {
      const keys: (string | number)[] =
        controls instanceof Array
          ? controls.map((_, i) => i)
          : Object.keys(controls);
      if (
        !keys.some(
          (key: string | number) =>
            (!r || r.test(key + '')) && controls[key].value
        )
      ) {
        return {
          atLeastOneRequired: {
            text: 'At least one should be selected',
          },
        };
      }
    }
    return null;
  };
}
