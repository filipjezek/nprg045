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
import { takeUntil, withLatestFrom } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { Labelled } from 'src/app/widgets/select/select.component';
import { FilterBase } from '../filter-base';
import { SQLBuilder } from '../../../sql/sql-builder';

@Component({
  selector: 'mozaik-filter-string',
  templateUrl: './filter-string.component.html',
  styleUrls: ['./filter-string.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterStringComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterStringComponent
  extends FilterBase
  implements OnInit, ControlValueAccessor
{
  form = new FormGroup({
    must: new FormControl(1, Validators.required),
    op: new FormControl('=', Validators.required),
    right: new FormControl<string>('', Validators.required),
    caseSensitive: new FormControl(1, Validators.required),
  });

  options: Labelled<string>[] = [
    { label: 'be equal to', value: '=' },
    { label: 'not be equal to', value: '!=' },
    { label: 'start with', value: 'LIKE_START' },
    { label: 'end with', value: 'LIKE_END' },
    { label: 'contain', value: 'LIKE_SUBSTR' },
  ];
  mustOptions: Labelled<number>[] = [
    { label: 'must', value: 1 },
    { label: 'must not', value: 0 },
  ];
  caseOptions: Labelled<number>[] = [
    { label: 'case sensitive', value: 1 },
    { label: 'case insensitive', value: 0 },
  ];

  constructor(store: Store<State>) {
    super(store);
  }

  writeValue(obj: string): void {
    if (!obj) return;
    // [NOT] {key|LOWER(key)} op {right|LOWER(right)}
    const tokens = obj.split(' ');
    const not = tokens[0] == 'NOT';
    if (not) tokens.shift();

    let cs = true;
    if (tokens[2].startsWith('LOWER(')) {
      tokens[2] = tokens[2].slice(6, -1);
      cs = false;
    }
    if (tokens[1] == 'LIKE') {
      if (tokens[2][0] == '%' && tokens[2].endsWith('%')) {
        tokens[1] = 'LIKE_SUBSTR';
        tokens[2] = tokens[2].slice(1, -1);
      } else if (tokens[0] == '%') {
        tokens[1] = 'LIKE_END';
        tokens[2] = tokens[2].slice(1);
      } else {
        tokens[1] = 'LIKE_START';
        tokens[2] = tokens[2].slice(0, -1);
      }
    }

    this.form.setValue({
      must: +!not,
      op: tokens[1],
      right: tokens[2],
      caseSensitive: +cs,
    });
  }
  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(withLatestFrom(this.sqlBuilder), takeUntil(this.onDestroy$))
      .subscribe(([val, builder]) => {
        if (!this.form.valid) {
          return fn(null);
        }

        const escapedKey = builder.escapeColumn(this.key) + this.path;
        const tokens = val.op.split('_');
        let condition = +val.must ? '' : 'NOT ';
        condition += +val.caseSensitive ? escapedKey : `LOWER(${escapedKey})`;
        condition += ` ${tokens[0]} `;
        let wrappedVal =
          (tokens[1] && tokens[1] != 'START' ? "'%" : "'") +
          SQLBuilder.sanitizeStr(
            +val.caseSensitive ? val.right : val.right.toLowerCase()
          ) +
          (tokens[1] && tokens[1] != 'END' ? "%'" : "'");
        condition += wrappedVal;
        fn(condition);
      });
  }

  ngOnInit(): void {}
}
