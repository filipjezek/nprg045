import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Ads } from 'src/app/store/reducers/ads.reducer';

@Component({
  selector: 'mozaik-ds-info',
  templateUrl: './ds-info.component.html',
  styleUrls: ['./ds-info.component.scss'],
})
export class DsInfoComponent implements OnInit {
  @Input() ds: Ads;
  @HostBinding('class.collapsed') collapsed = true;

  faChevronLeft = faChevronLeft;

  constructor() {}

  ngOnInit(): void {}
}
