import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';

@Component({
  selector: 'mozaik-cell-list',
  templateUrl: './cell-list.component.html',
  styleUrls: ['./cell-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellListComponent implements OnInit, DSCell<any[]> {
  constructor(@Inject(DSCELL_VAL) public value: any[]) {}

  ngOnInit(): void {}

  isObject(value: any) {
    return typeof value === 'object' || value === undefined;
  }
}
