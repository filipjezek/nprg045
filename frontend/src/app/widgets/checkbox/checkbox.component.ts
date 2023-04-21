import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
} from '@angular/animations';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';

@Component({
  selector: 'mozaik-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  animations: [
    trigger('splash', [
      transition('* => checking', [
        query(
          '.splash',
          style({
            height: 0,
            width: 0,
            opacity: 0.8,
          })
        ),
        query(
          '.splash',
          animate(
            '0.3s linear',
            style({
              height: '400%',
              width: '400%',
              opacity: 0,
            })
          )
        ),
      ]),
      transition('checking => checked', [
        query(
          '.check',
          style({
            width: 0,
          })
        ),
        query(
          '.check',
          animate(
            '0.2s linear',
            style({
              width: '*',
            })
          )
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent
  extends UnsubscribingComponent
  implements ControlValueAccessor
{
  control = new FormControl();
  private onTouchedCb: () => void;
  private onChangeCb: (val: boolean) => void;
  checkboxState: 'unchecking' | 'checking' | 'checked' | 'unchecked';

  @Input() disabled = false;
  @Input() labelPosition: 'left' | 'right' = 'left';
  @Input() tabindex = 0;
  @Input() get value(): boolean {
    return this.control.value;
  }
  set value(v: boolean) {
    this.control.setValue(v);
    this.checkboxState = v ? 'checked' : 'unchecked';
  }

  constructor() {
    super();
  }

  writeValue(v: boolean) {
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
  }

  changeState() {
    this.checkboxState = this.value ? 'unchecking' : 'checking';
  }

  onChange(v: boolean) {
    this.onChangeCb?.(v);
    this.checkboxState = v ? 'checked' : 'unchecked';
  }

  onTouched() {
    this.onTouchedCb?.();
  }
}
