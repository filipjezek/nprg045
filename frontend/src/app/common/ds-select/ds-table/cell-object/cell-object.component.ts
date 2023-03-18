import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'mozaik-cell-object',
  templateUrl: './cell-object.component.html',
  styleUrls: ['./cell-object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellObjectComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
