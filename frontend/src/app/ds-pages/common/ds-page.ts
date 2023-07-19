import {
  Injectable,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
  implements OnInit, OnChanges
{
  public controls: TemplateRef<any>;
  @Input() ads: Ads;

  public fullAds$ = this.store
    .select((x) => x.ads.selectedAds)
    .pipe(map((all) => all.find((ds) => ds.index == this.ads.index) as T));
  public tabState$ = this.store
    .select((x) => x.inspector.tabs)
    .pipe(map((all) => all[this.ads.index] as U));
  protected sharedControls$ = this.store.select(
    (x) => x.inspector.sharedControls
  );

  constructor(protected store: Store<State>) {}

  ngOnInit(): void {
    this.tabState$.pipe(take(1)).subscribe((s) => {
      if (!s) {
        this.initTabState();
      }
    });

    if (this.ads) {
      // setTimeout is needed to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.loadAds();
      }, 0);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ads']) {
      const ch = changes['ads'];
      if (isEqual(ch.currentValue, ch.previousValue)) return;
      this.loadAds();
    }
  }

  private loadAds() {
    this.store
      .select(routerSelectors.selectRouteParam('path'))
      .pipe(take(1))
      .subscribe((path) => {
        this.store.dispatch(loadSpecificAds({ path, index: this.ads.index }));
      });
  }

  protected initTabState() {
    this.store.dispatch(setTabState({ index: this.ads.index, state: {} }));
  }
}
