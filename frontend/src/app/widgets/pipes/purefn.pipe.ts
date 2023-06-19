import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipes are recalculated only when their parameters change.
 * This exploits the mechanism in order to save recalculations
 * of template referenced component methods
 */
@Pipe({
  name: 'purefn',
})
export class PurefnPipe implements PipeTransform {
  transform<T>(fn: (...args: any[]) => T, ...args: unknown[]): T {
    return fn(...args);
  }
}
