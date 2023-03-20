import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';

@Component({
  selector: 'mozaik-cell-object',
  templateUrl: './cell-object.component.html',
  styleUrls: ['./cell-object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellObjectComponent implements OnInit, DSCell<any> {
  constructor(@Inject(DSCELL_VAL) public value: any) {}

  ngOnInit(): void {}
}
