import { Component, OnInit, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';

export interface Labelled<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'mozaik-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent
  extends UnsubscribingComponent
  implements OnInit, ControlValueAccessor
{
  private static instanceCount = 0;

  @Input() placeholder = '';
  @Input() label = '';
  @Input() disabled = false;
  @Input() width: number;
  @Input() items: Labelled<string | number>[];
  @Input() get value(): string | number {
    return this.control.value;
  }
  set value(v) {
    this.control.setValue(v);
  }

  control = new FormControl<string | number>({
    value: '',
    disabled: this.disabled,
  });
  private onTouchedCb: () => void;
  private onChangeCb: (v: string | number) => void;

  id: number;

  constructor() {
    super();
    this.id = ++SelectComponent.instanceCount;
  }

  ngOnInit() {}

  writeValue(v: string) {
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

  onChange(v: number | string) {
    this.onChangeCb(v);
  }

  onTouched() {
    this.onTouchedCb();
  }
}
