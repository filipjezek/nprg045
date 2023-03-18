import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'mozaik-cell-generic',
  templateUrl: './cell-generic.component.html',
  styleUrls: ['./cell-generic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellGenericComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
