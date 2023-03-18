import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { colorFromString } from 'src/app/utils/color-from-string';

@Component({
  selector: 'mozaik-cell-keyvalue',
  templateUrl: './cell-keyvalue.component.html',
  styleUrls: ['./cell-keyvalue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellKeyvalueComponent implements OnInit {
  @Input() values: Record<string, number | string | boolean> = {};
  constructor() {}

  ngOnInit(): void {}

  colorFromString = colorFromString;
}
