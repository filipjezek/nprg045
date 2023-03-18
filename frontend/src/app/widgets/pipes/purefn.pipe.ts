import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'purefn',
})
export class PurefnPipe implements PipeTransform {
  transform<T>(fn: (...args: any[]) => T, ...args: unknown[]): T {
    return fn(...args);
  }
}
