import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { startWith, takeUntil, withLatestFrom } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { Labelled } from 'src/app/widgets/select/select.component';
import { FilterBase } from '../filter-base';

@Component({
  selector: 'mozaik-filter-number',
  templateUrl: './filter-number.component.html',
  styleUrls: ['./filter-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterNumberComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterNumberComponent
  extends FilterBase
  implements OnInit, ControlValueAccessor
{
  form = new FormGroup({
    op: new FormControl('>', Validators.required),
    right1: new FormControl<number>(null, Validators.required),
    right2: new FormControl<number>(
      { value: null, disabled: true },
      Validators.required
    ),
  });

  options: Labelled<string>[] = [
    { label: 'greater than', value: '>' },
    { label: 'greater than or equal to', value: '>=' },
    { label: 'less than', value: '<' },
    { label: 'less than or equal to', value: '<=' },
    { label: 'equal to', value: '=' },
    { label: 'not equal to', value: '!=' },
    { label: 'between', value: 'BETWEEN' },
  ];

  constructor(store: Store<State>) {
    super(store);
  }

  writeValue(obj: string): void {
    if (!obj) return;
    const tokens = obj.split(' ');
    if (tokens[1] == 'BETWEEN') {
      this.form.patchValue({
        op: tokens[1],
        right1: +tokens[2],
        right2: +tokens[4],
      });
    } else {
      this.form.patchValue({
        op: tokens[1],
        right1: +tokens[2],
      });
    }
  }
  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(withLatestFrom(this.sqlBuilder), takeUntil(this.onDestroy$))
      .subscribe(([val, builder]) => {
        if (!this.form.valid) {
          return fn(null);
        }
        let condition = `${builder.escapeColumn(this.key)}${this.path} ${
          val.op
        } ${val.right1}`;
        if (val.op == 'BETWEEN') {
          condition += ` AND ${val.right2}`;
        }
        fn(condition);
      });
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(startWith(this.form.value), takeUntil(this.onDestroy$))
      .subscribe((val) => {
        this.form
          .get('right2')
          [val.op == 'BETWEEN' ? 'enable' : 'disable']({ emitEvent: false });
      });
  }
}
