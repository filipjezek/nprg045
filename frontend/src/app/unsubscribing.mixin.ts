import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export function Unsubscribing(base: new (...args: any[]) => any) {
  return class extends base implements OnDestroy {
    protected onDestroy$ = new Subject<void>();

    ngOnDestroy() {
      super.ngOnDestroy?.();
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }
  };
}

export const UnsubscribingComponent = Unsubscribing(class {});
