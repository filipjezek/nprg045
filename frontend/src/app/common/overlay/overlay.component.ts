import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'mozaik-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
