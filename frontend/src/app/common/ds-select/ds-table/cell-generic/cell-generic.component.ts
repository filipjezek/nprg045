import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  InjectionToken,
  Input,
  OnInit,
} from '@angular/core';

export interface DSCell<T> {
  value: T;
}

export const DSCELL_VAL = new InjectionToken('ds table cell value', {
  factory: () => null,
});

@Component({
  selector: 'mozaik-cell-generic',
  templateUrl: './cell-generic.component.html',
  styleUrls: ['./cell-generic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellGenericComponent implements OnInit, DSCell<any> {
  @Input() value: any;

  constructor(@Inject(DSCELL_VAL) value: any) {
    this.value = value;
  }

  ngOnInit(): void {}
}
