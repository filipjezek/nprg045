import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvaluenosort',
})
export class KeyValueNoSortPipe implements PipeTransform {
  transform<K extends string | number | symbol, V>(
    obj: Record<K, V>
  ): { key: K; value: V }[] {
    return Object.entries<V>(obj).map(([key, value]) => ({
      key: key as K,
      value,
    }));
  }
}
