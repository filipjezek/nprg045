import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'mozaik-cell-link',
  templateUrl: './cell-link.component.html',
  styleUrls: ['./cell-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellLinkComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
