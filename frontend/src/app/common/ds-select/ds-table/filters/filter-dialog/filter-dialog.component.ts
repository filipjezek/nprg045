import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { Dialog } from 'src/app/dialog';
import {
  state,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { dialogClose, dialogOpen } from 'src/app/animations';
import { ColType, getColType } from '../../ds-table.component';
import { FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { AggregationStage } from '../../../sql/user-sql-functions/make-intersection';
import { cloneDeep, union, uniq } from 'lodash-es';
import { isPrimitive } from 'src/app/utils/is-primitive';

@Component({
  selector: 'mozaik-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss'],
  animations: [
    trigger('appear', [
      state(
        'closing',
        style({
          height: 0,
        })
      ),
      transition(':enter', [useAnimation(dialogOpen)]),
      transition('* => closing', [useAnimation(dialogClose)]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDialogComponent extends Dialog implements OnInit {
  static readonly selector = 'filter-dialog';

  @HostBinding('class.wide') private get wide() {
    return this.type == ColType.keyvalue;
  }

  control = new FormControl<string>(null, Validators.required);
  propControl = new FormControl();
  ColType = ColType;

  @Input() type: ColType;
  @Input() get distinctValues() {
    return this._distinctVals;
  }
  set distinctValues(vals) {
    this._distinctVals = vals;
    this.makeUnion();
  }
  private _distinctVals: any[];
  @Input() key: string;

  propType: ColType;
  union: any;
  distinctPropVals: any[] = null;

  constructor(el: ElementRef) {
    super(el);
  }

  ngOnInit(): void {
    this.propControl.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((val) => {
        this.control.reset();
        this.propType = getColType(this.union[val]);
        this.distinctPropVals = uniq(
          this.distinctValues.map((x) => x?.[val] ?? null)
        );
      });
  }

  private makeUnion() {
    if (!this.distinctValues?.length || this.type != ColType.keyvalue) return;
    let acc = makeUnion(this.distinctValues[0], null, AggregationStage.init);
    for (let i = 1; i < this.distinctValues.length; i++) {
      makeUnion(this.distinctValues[i], acc, AggregationStage.step);
    }
    this.union = makeUnion(null, acc, AggregationStage.finalize);
  }

  propToPath(prop: string) {
    if (!prop) return '';
    return '->' + prop.split('.').join('->');
  }
}

function makeUnion(val: any, acc: any, stage: AggregationStage) {
  if (stage == AggregationStage.init) {
    return cloneDeep(val);
  }
  if (stage == AggregationStage.step) {
    if (isPrimitive(val) && isPrimitive(acc)) {
      return val ?? acc;
    }

    if (isPrimitive(val)) {
      return acc;
    }
    if (isPrimitive(acc)) {
      return val;
    }
    if (val instanceof Array && acc instanceof Array) {
      return union(val, acc);
    }

    for (const valKey in val) {
      if (!Object.prototype.hasOwnProperty.call(val, valKey)) {
        continue;
      }

      const keyUnion = makeUnion(
        val[valKey],
        acc[valKey],
        AggregationStage.step
      );
      if (keyUnion === undefined || keyUnion === null) {
        delete acc[valKey];
      } else {
        acc[valKey] = keyUnion;
      }
    }
  }
  return acc;
}
