import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'mozaik-cell-empty',
  templateUrl: './cell-empty.component.html',
  styleUrls: ['./cell-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellEmptyComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
