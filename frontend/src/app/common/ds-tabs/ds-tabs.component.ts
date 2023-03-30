import {
  Component,
  ChangeDetectionStrategy,
  ComponentRef,
  ViewChildren,
  ViewContainerRef,
  QueryList,
  AfterViewInit,
  Type,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatestWith,
  delay,
  filter,
  from,
  map,
  Observable,
  pipe,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { State } from 'src/app/store/reducers';
import { Ads, AdsIdentifier } from 'src/app/store/reducers/ads.reducer';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';

@Component({
  selector: 'mozaik-ds-tabs',
  templateUrl: './ds-tabs.component.html',
  styleUrls: ['./ds-tabs.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent
  extends UnsubscribingComponent
  implements AfterViewInit
{
  private paramToAds = pipe(
    map<string, number[]>((param) =>
      param ? param.split(',').map((n) => +n) : []
    ),
    withLatestFrom(
      this.store.select((x) => x.ads.allAds).pipe(filter((x) => !!x?.length))
    ),
    map(([indices, ads]) => indices.map((i) => ads[i]))
  );
  @ViewChildren('tabContent', { read: ViewContainerRef })
  private viewContainerRefs: QueryList<ViewContainerRef>;

  viewing$ = this.store
    .select(routerSelectors.selectRouteParam('viewing'))
    .pipe(this.paramToAds);
  ready$ = this.store.select(routerSelectors.selectRouteParam('ready')).pipe(
    this.paramToAds,
    combineLatestWith(this.viewing$),
    map(([ready, viewing]) =>
      ready.map((ds) => ({ ds, viewing: viewing.includes(ds) }))
    ),
    tap(console.log)
  );
  ads$ = this.store.select((x) => x.ads.allAds);

  /**
   * ds.index mapped to corresponding component
   */
  tabs: Record<number, ComponentRef<any>> = {};

  constructor(private store: Store<State>) {
    super();
  }

  ngAfterViewInit(): void {
    this.viewing$
      .pipe(
        map((viewing) => [this.viewContainerRefs, viewing] as const),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([containers, ads]) => {
        containers.forEach(async (container, i) => {
          const ds = ads[i];
          await this.createComponent(ds, container);
        });
      });
  }

  private preloadPage(ds: AdsIdentifier) {
    switch (ds) {
      case AdsIdentifier.Connections:
        // case AdsIdentifier.PerNeuronValue:
        return Promise.all([
          import('../../ds-pages/model-page/model-page.component').then(
            (x) => x.ModelPageComponent
          ),
          import('../../ds-pages/model-page/model-page.module').then(
            (x) => x.ModelPageModule
          ),
        ]);
      default:
        return Promise.all([
          import(
            '../../ds-pages/single-value-page/single-value-page.component'
          ).then((x) => x.SingleValuePageComponent),
          import(
            '../../ds-pages/single-value-page/single-value-page.module'
          ).then((x) => x.SingleValuePageModule),
        ]);
    }
  }

  private async createComponent(ds: Ads, container: ViewContainerRef) {
    const [comp, mod] = await this.preloadPage(ds.identifier);
    const compref = container.createComponent(comp as Type<any>);
    compref.onDestroy(() => console.log(compref.instance.id, 'was destroyed'));
    return compref;
  }

  trackByDsIndex(index: number, value: { ds: Ads } | Ads) {
    return 'index' in value ? value.index : value.ds.index;
  }
}
