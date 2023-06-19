import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(miliseconds: number): string {
    return (
      Math.floor(miliseconds / (1000 * 60)) +
      ':' +
      ('' + (Math.floor(miliseconds / 1000) % 60)).padStart(2, '0')
    );
  }
}
