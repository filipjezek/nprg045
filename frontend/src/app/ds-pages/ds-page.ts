import { Injectable, Input } from '@angular/core';
import { Ads } from '../store/reducers/ads.reducer';

@Injectable()
export class DsPage {
  @Input() public ads: Ads;
}
