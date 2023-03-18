import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'mozaik-cell-list',
  templateUrl: './cell-list.component.html',
  styleUrls: ['./cell-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellListComponent implements OnInit {
  @Input() values: any[] = [];

  constructor() {}

  ngOnInit(): void {}

  isObject(value: any) {
    return typeof value === 'object' || value === undefined;
  }
}
