import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  forwardRef,
} from '@angular/core';
import { FilterBase } from '../filter-base';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { takeUntil, withLatestFrom } from 'rxjs';
import { Labelled } from 'src/app/widgets/select/select.component';
import { SQLBuilder, SQLBuilderFactory } from '../../../sql/sql-builder';

@Component({
  selector: 'mozaik-filter-array',
  templateUrl: './filter-array.component.html',
  styleUrls: ['./filter-array.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterArrayComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterArrayComponent
  extends FilterBase
  implements OnInit, ControlValueAccessor
{
  form = new FormGroup({
    must: new FormControl(1, Validators.required),
    item: new FormControl(null, Validators.required),
    type: new FormControl<'number' | 'string' | 'boolean'>(
      'string',
      Validators.required
    ),
  });

  typeOptions: Labelled<string>[] = [
    { label: 'string', value: 'string' },
    { label: 'number', value: 'number' },
    { label: 'boolean', value: 'boolean' },
  ];
  mustOptions: Labelled<number>[] = [
    { label: 'must', value: 1 },
    { label: 'must not', value: 0 },
  ];
  boolOptions: Labelled<number>[] = [
    { label: 'TRUE', value: 1 },
    { label: 'FALSE', value: 0 },
  ];

  constructor(store: Store<State>, sqlFactory: SQLBuilderFactory) {
    super(store, sqlFactory);
  }

  writeValue(obj: any): void {
    return;
  }
  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(withLatestFrom(this.sqlBuilder), takeUntil(this.onDestroy$))
      .subscribe(([val, builder]) => {
        if (!this.form.valid) {
          return fn(null);
        }

        let converted: any = val.item;
        if (val.type == 'boolean') {
          converted = !!converted;
        }

        const condition = `${+val.must ? '' : 'NOT '}${SQLBuilder.escapeValue(
          converted
        )}${this.path} IN ${builder.escapeColumn(this.key)}`;
        fn(condition);
      });
  }

  ngOnInit(): void {
    this.form
      .get('type')
      .valueChanges.pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.form.get('item').reset();
      });
  }
}
