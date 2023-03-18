import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { State } from 'src/app/store/reducers/';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import alasql from 'alasql';

@Component({
  selector: 'mozaik-ds-select',
  templateUrl: './ds-select.component.html',
  styleUrls: ['./ds-select.component.scss'],
})
export class DsSelectComponent implements OnInit {
  ads$ = this.store.select((x) => x.ads.allAds);
  path$ = this.store.select(routerSelectors.selectRouteParam('path'));
  sqlres$ = this.ads$.pipe(
    map((data) => alasql('SELECT `index`, algorithm, stimulus FROM ?', [data]))
  );

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}
}
