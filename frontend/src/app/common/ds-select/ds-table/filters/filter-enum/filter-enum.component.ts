import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  forwardRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntil, withLatestFrom } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { Labelled } from 'src/app/widgets/select/select.component';
import { FilterBase } from '../filter-base';
import { atLeastOneValidator } from 'src/app/utils/at-least-one.validator';
import { SQLBuilder, SQLBuilderFactory } from '../../../sql/sql-builder';

@Component({
  selector: 'mozaik-filter-enum',
  templateUrl: './filter-enum.component.html',
  styleUrls: ['./filter-enum.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterEnumComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterEnumComponent
  extends FilterBase
  implements OnInit, ControlValueAccessor
{
  form = new FormGroup({
    must: new FormControl(1, Validators.required),
    values: new FormArray<AbstractControl<boolean>>([], atLeastOneValidator()),
  });

  mustOptions: Labelled<number>[] = [
    { label: 'must', value: 1 },
    { label: 'must not', value: 0 },
  ];

  @Input() get values(): any[] {
    return this._values;
  }
  set values(v: any[]) {
    this._values = v;
    const fa = this.form.get('values') as FormArray;
    fa.reset();
    while (v.length < fa.length) fa.removeAt(fa.length - 1);
    while (v.length > fa.length) fa.push(new FormControl(false));
  }
  private _values: any[];

  constructor(store: Store<State>, sqlFactory: SQLBuilderFactory) {
    super(store, sqlFactory);
  }

  writeValue(obj: string): void {
    return;
  }
  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(withLatestFrom(this.sqlBuilder), takeUntil(this.onDestroy$))
      .subscribe(([val, builder]) => {
        if (!this.form.valid) {
          return fn(null);
        }
        const escapedKey = builder.escapeColumn(this.key) + this.path;

        let condition = `${escapedKey} ${+val.must ? '' : 'NOT'} `;
        condition += `IN (${this.values
          .filter((x, i) => val.values[i] && x !== null && x !== undefined)
          .map((x) => SQLBuilder.escapeValue(x))
          .join(', ')})`;
        if (
          this.values.findIndex(
            (x, i) => (x === null || x === undefined) && val.values[i]
          ) != -1
        ) {
          condition = +val.must
            ? `(${condition} OR ${escapedKey} IS NULL)`
            : `(${condition} AND ${escapedKey} IS NOT NULL)`;
        }
        fn(condition);
      });
  }

  ngOnInit(): void {}
}
