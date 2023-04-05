import { Component, OnInit } from '@angular/core';
import { DsPage } from '../ds-page';
import { Ads } from 'src/app/store/reducers/ads.reducer';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';

@Component({
  selector: 'mozaik-single-value-page',
  templateUrl: './single-value-page.component.html',
  styleUrls: ['./single-value-page.component.scss'],
})
export class SingleValuePageComponent extends DsPage<Ads> implements OnInit {
  private static instances = 0;
  id = ++SingleValuePageComponent.instances;

  constructor(store: Store<State>) {
    super(store);
  }

  ngOnInit(): void {}
}
