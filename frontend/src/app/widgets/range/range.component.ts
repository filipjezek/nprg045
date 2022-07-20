import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'mozaik-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeComponent),
      multi: true,
    },
  ],
})
export class RangeComponent implements OnInit, ControlValueAccessor {
  @Input() step: number | 'any';
  @Input() min: number;
  @Input() max: number;
  @Input() get value(): number {
    return this.control.value;
  }
  set value(v: number) {
    this.control.setValue(v);
  }
  control = new FormControl<number>(undefined);
  disabled = false;
  private onTouchedCb: () => void;
  private onChangeCb: (val: number) => void;

  constructor() {}

  ngOnInit(): void {}

  writeValue(v: number) {
    this.value = v;
  }

  registerOnChange(fn: any) {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCb = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.control[isDisabled ? 'disable' : 'enable']();
  }

  onChange(v: number) {
    this.onChangeCb(v);
  }

  onTouched() {
    this.onTouchedCb();
  }
}
