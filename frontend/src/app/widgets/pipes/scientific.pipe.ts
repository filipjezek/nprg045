import { DecimalPipe } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scientific',
})
export class ScientificPipe implements PipeTransform {
  private decimal = new DecimalPipe(this.locale);

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: number): string {
    if (typeof value !== 'number') return value;
    if (value < 10000 || value > 1e-4)
      return this.decimal.transform(value, '1.0-4');
    return value.toExponential(2);
  }
}
