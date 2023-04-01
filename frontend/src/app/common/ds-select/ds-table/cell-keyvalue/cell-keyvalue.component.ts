import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';

@Component({
  selector: 'mozaik-cell-keyvalue',
  templateUrl: './cell-keyvalue.component.html',
  styleUrls: ['./cell-keyvalue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellKeyvalueComponent
  implements OnInit, DSCell<Record<string, number | string | boolean>>
{
  constructor(
    @Inject(DSCELL_VAL) public value: Record<string, number | string | boolean>
  ) {}

  ngOnInit(): void {}
}
