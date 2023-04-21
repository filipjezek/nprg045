import { Component, OnInit, Input, forwardRef } from '@angular/core';
import {
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'mozaik-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements OnInit, ControlValueAccessor {
  @Input() disabled = false;
  @Input() readonly = false;

  control = new FormControl({ value: '', disabled: this.disabled });
  private onTouchedCb: () => void;
  private onChangeCb: (value: any) => void;

  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() autocomplete = 'off';
  @Input() get value(): any {
    return this.control.value;
  }
  set value(v: any) {
    this.control.setValue(v);
  }

  constructor() {}

  ngOnInit() {}

  writeValue(v: any) {
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

  onChange(v: string) {
    this.onChangeCb?.(v);
  }

  onTouched() {
    this.onTouchedCb?.();
  }
}
