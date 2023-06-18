import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';

export interface RadioOption {
  label: string;
  value: string;
}

@Component({
  selector: 'mozaik-button-radio',
  templateUrl: './button-radio.component.html',
  styleUrls: ['./button-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonRadioComponent),
      multi: true,
    },
  ],
})
export class ButtonRadioComponent implements OnInit, ControlValueAccessor {
  @Input() options: RadioOption[] = [];
  @Input() name = 'button-radio';

  control = new FormControl();
  private disabled = false;
  private onTouchedCb: () => void;
  private onChangeCb: (val: string) => void;

  @Input() get value(): string {
    return this.control.value;
  }
  set value(v: string) {
    this.control.setValue(v);
  }

  constructor() {}

  ngOnInit(): void {}

  writeValue(v: string) {
    if (!v) this.value = this.options[0].value;
    else this.value = v;
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
