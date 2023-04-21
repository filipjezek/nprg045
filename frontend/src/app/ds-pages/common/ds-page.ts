import { Injectable, Input, OnInit } from '@angular/core';
import { Ads, AdsIdentifier } from '../../store/reducers/ads.reducer';
import { isEqual } from 'lodash-es';
import { Store } from '@ngrx/store';
import { State } from '../../store/reducers';
import { loadSpecificAds } from '../../store/actions/ads.actions';
import { map, take, withLatestFrom } from 'rxjs';
import { routerSelectors } from '../../store/selectors/router.selectors';
import { TabState } from '../../store/reducers/inspector.reducer';
import { setTabState } from 'src/app/store/actions/inspector.actions';

export type DsPageConstructor<T extends Ads, U extends TabState> = new (
  store: Store<State>
) => DsPage<T, U>;
@Injectable()
export class DsPage<T extends Ads = Ads, U extends TabState = TabState>
  implements OnInit
{
  @Input() public set ads(ds: Ads) {
    if (isEqual(ds, this._ads)) return;
    this._ads = ds;
    this.store
      .select(routerSelectors.selectRouteParam('path'))
      .pipe(
        withLatestFrom(this.store.select((x) => x.ads.selectedAds)),
        take(1)
      )
      .subscribe(([path, selected]) => {
        if (
          ds.identifier === AdsIdentifier.Connections ||
          selected.some((s) => s.index == ds.index)
        )
          return;
        this.store.dispatch(loadSpecificAds({ path, index: ds.index }));
      });
  }
  get ads() {
    return this._ads;
  }
  private _ads: Ads;

  public fullAds$ = this.store
    .select((x) => x.ads.selectedAds)
    .pipe(map((all) => all.find((ds) => ds.index == this.ads.index) as T));

  public tabState$ = this.store
    .select((x) => x.inspector.tabs)
    .pipe(map((all) => all[this.ads.index] as U));

  constructor(protected store: Store<State>) {}

  ngOnInit(): void {
    this.tabState$.pipe(take(1)).subscribe((s) => {
      if (!s) {
        this.initTabState();
      }
    });
  }

  protected initTabState() {
    this.store.dispatch(setTabState({ index: this.ads.index, state: {} }));
  }
}
