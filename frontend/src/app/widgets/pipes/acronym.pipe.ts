import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'acronym',
})
export class AcronymPipe implements PipeTransform {
  transform(value: string): unknown {
    return value.replace(/[^A-Z]/g, '');
  }
}
