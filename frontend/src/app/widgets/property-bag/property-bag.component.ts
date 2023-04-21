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
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { colorFromString } from 'src/app/utils/color-from-string';

@Component({
  selector: 'mozaik-property-bag',
  templateUrl: './property-bag.component.html',
  styleUrls: ['./property-bag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PropertyBagComponent),
      multi: true,
    },
  ],
})
export class PropertyBagComponent implements OnInit, ControlValueAccessor {
  @Input() bag: any;
  colorFromString = colorFromString;
  hasControl = false;
  control = new FormControl();

  onTouchedCb: () => void;
  onChangeCb: (val: any) => void;

  constructor() {}

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }
  registerOnChange(fn: any): void {
    this.hasControl = true;
    this.onChangeCb = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.control[isDisabled ? 'disable' : 'enable']();
  }

  ngOnInit(): void {}
}
