import {
  Component,
  ChangeDetectionStrategy,
  ComponentRef,
  ViewChildren,
  ViewContainerRef,
  QueryList,
  AfterViewInit,
  Type,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  combineLatestWith,
  delay,
  filter,
  from,
  map,
  Observable,
  pipe,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { DsPage } from 'src/app/ds-pages/ds-page';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { State } from 'src/app/store/reducers';
import { Ads, AdsIdentifier } from 'src/app/store/reducers/ads.reducer';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import {
  AggregationStage,
  makeIntersection,
} from '../ds-select/sql/user-sql-functions/make-intersection';
import { subtract } from '../ds-select/sql/user-sql-functions/subtract';
import { Router } from '@angular/router';

@Component({
  selector: 'mozaik-ds-tabs',
  templateUrl: './ds-tabs.component.html',
  styleUrls: ['./ds-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    map(([ready, viewing]) => {
      if (!ready.length) return [];

      let inter = makeIntersection(ready[0], null, AggregationStage.init);
      delete inter.index;
      for (let i = 1; i < ready.length; ++i) {
        inter = makeIntersection(ready[i], inter, AggregationStage.step);
      }

      return ready.map((ds) => ({
        ds: subtract(ds, inter) as Partial<Ads> & { index: number },
        viewing: viewing.includes(ds),
      }));
    })
  );
  ads$ = this.store.select((x) => x.ads.allAds);

  /**
   * ds.index mapped to corresponding component
   */
  tabs: Record<number, ComponentRef<any>> = {};

  private reorderedTabs: number[];

  constructor(
    private store: Store<State>,
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.viewing$
      .pipe(
        delay(0),
        map((viewing) => [this.viewContainerRefs, viewing] as const),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([containers, ads]) => {
        containers.forEach(async (container, i) => {
          const ds = ads[i];
          await this.createComponent(ds, container);
          this.changeDetector.markForCheck();
        });
      });
  }

  private async preloadPage(ds: AdsIdentifier): Promise<Type<DsPage>> {
    switch (ds) {
      case AdsIdentifier.Connections:
        // case AdsIdentifier.PerNeuronValue:
        await import('../../ds-pages/model-page/model-page.module');
        return import('../../ds-pages/model-page/model-page.component').then(
          (x) => x.ModelPageComponent
        );
      default:
        await import(
          '../../ds-pages/single-value-page/single-value-page.module'
        );
        return import(
          '../../ds-pages/single-value-page/single-value-page.component'
        ).then((x) => x.SingleValuePageComponent);
    }
  }

  private async createComponent(ds: Ads, container: ViewContainerRef) {
    const comp = await this.preloadPage(ds.identifier);
    const compref = container.createComponent(comp);
    compref.instance.ads = ds;
    return compref;
  }

  trackByDsIndex(index: number, value: { ds: Ads } | Ads) {
    return 'index' in value ? value.index : value.ds.index;
  }

  initReorderedTabs() {
    this.ready$.pipe(take(1)).subscribe((ads) => {
      this.reorderedTabs = ads.map((ds) => ds.ds.index);
    });
  }

  swapTabs(ds: { index: number }, left: boolean) {
    const i = this.reorderedTabs.findIndex((index) => ds.index == index);
    const other = left ? i - 1 : i + 1;
    this.reorderedTabs[i] = this.reorderedTabs[other];
    this.reorderedTabs[other] = ds.index;
  }

  commitReoderedTabs() {
    this.store
      .select(routerSelectors.selectRouteParams)
      .pipe(take(1))
      .subscribe((params) => {
        const reordered = { ...params };
        delete reordered['path'];
        reordered['ready'] = this.reorderedTabs;

        this.router.navigate(['datastore', params['path'], 'ds', reordered]);
      });
  }
}
