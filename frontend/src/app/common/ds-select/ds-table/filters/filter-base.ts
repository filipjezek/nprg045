import { Directive, Input } from '@angular/core';
import { map } from 'rxjs';
import { SQLBuilder } from '../../sql/sql-builder';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { FormGroup } from '@angular/forms';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';

@Directive({ inputs: ['key', 'path'] })
export class FilterBase extends UnsubscribingComponent {
  form: FormGroup;
  protected sqlBuilder = this.store
    .select((x) => x.navigator.query)
    .pipe(map((x) => new SQLBuilder(x)));

  @Input() public key: string;
  @Input() public path: string = '';

  private onTouchedCb: () => void;

  constructor(protected store: Store<State>) {
    super();
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.form[isDisabled ? 'disable' : 'enable']();
  }

  onTouched() {
    this.onTouchedCb?.();
  }
}
