import { Component, OnInit } from '@angular/core';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mozaik-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
})
export class LoadingOverlayComponent implements OnInit {
  faCircleNotch = faCircleNotch;

  constructor() {}

  ngOnInit(): void {}
}
