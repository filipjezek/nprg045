import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export function Unsubscribing<T extends new (...args: any[]) => {}>(base: T) {
  return class extends base implements OnDestroy {
    protected onDestroy$ = new Subject<void>();

    ngOnDestroy() {
      // @ts-ignore
      super.ngOnDestroy?.();
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }
  };
}

export const UnsubscribingComponent = Unsubscribing(class {});
