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
  OnInit,
  TemplateRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Observable,
  combineLatestWith,
  delay,
  filter,
  map,
  shareReplay,
  startWith,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { DsPage } from 'src/app/ds-pages/common/ds-page';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { State } from 'src/app/store/reducers';
import { Ads, AdsIdentifier } from 'src/app/store/reducers/ads.reducer';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { subtract } from '../ds-select/sql/user-sql-functions/subtract';
import { Params, Router } from '@angular/router';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { FormControl } from '@angular/forms';
import { toggleSharedControls } from 'src/app/store/actions/inspector.actions';
import { Labelled } from 'src/app/widgets/select/select.component';
import { GroupingFn } from 'src/app/widgets/multiview/multiview.component';

@Component({
  selector: 'mozaik-ds-tabs',
  templateUrl: './ds-tabs.component.html',
  styleUrls: ['./ds-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent
  extends UnsubscribingComponent
  implements AfterViewInit, OnInit
{
  @ViewChildren('tabContent', { read: ViewContainerRef })
  private viewContainerRefs: QueryList<ViewContainerRef>;

  viewing$ = this.store.select(inspectorSelectors.selectViewing);
  ready$ = this.store.select(inspectorSelectors.selectReady).pipe(
    combineLatestWith(
      this.viewing$,
      this.store.select(inspectorSelectors.selectCommonReadyProps)
    ),
    map(([ready, viewing, commonReady]) => {
      if (!ready.length) return [];
      if (commonReady) delete commonReady.index;

      return ready.map((ds) => ({
        ds: subtract(ds, commonReady) as Partial<Ads> & { index: number },
        viewing: viewing.includes(ds),
      }));
    }),
    takeUntil(this.onDestroy$),
    shareReplay(1)
  );
  sharedControlsCtrl = new FormControl(false);
  groupingCtrl = new FormControl('index');
  firstOfType$: Observable<TemplateRef<any>[]>;

  groupingOptions: Labelled<string>[] = [
    { label: 'index', value: 'index' },
    { label: 'sheet', value: 'sheet' },
    { label: 'algorithm', value: 'algorithm' },
    { label: 'stimulus', value: 'stimulus' },
    { label: 'neuron', value: 'neuron' },
    { label: 'value name', value: 'valueName' },
    { label: 'identifier', value: 'identifier' },
  ];

  private reorderedTabs: number[];
  private compRefs: Map<ViewContainerRef, ComponentRef<DsPage>> = new Map();

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
          if (container.length) return;
          const ds = ads[i];
          this.compRefs.set(
            container,
            await this.createComponent(ds, container)
          );
          this.changeDetector.markForCheck();
        });
      });

    this.firstOfType$ = this.createFirstOfType();
  }

  ngOnInit(): void {
    this.store
      .select((x) => x.inspector.sharedControls)
      .pipe(
        filter((shared) => shared != this.sharedControlsCtrl.value),
        takeUntil(this.onDestroy$)
      )
      .subscribe((shared) => {
        this.sharedControlsCtrl.setValue(shared);
      });
    this.sharedControlsCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((val) =>
        this.store.dispatch(toggleSharedControls({ shared: val }))
      );

    this.subscribeGrouping();
  }

  private async preloadPage(ds: AdsIdentifier): Promise<Type<DsPage<Ads>>> {
    switch (ds) {
      case AdsIdentifier.Connections:
      case AdsIdentifier.PerNeuronValue:
        await import('../../ds-pages/model-page/model-page.module');
        return import('../../ds-pages/model-page/model-page.component').then(
          (x) => x.ModelPageComponent
        );
      case AdsIdentifier.PerNeuronPairValue:
        await import(
          '../../ds-pages/per-neuron-pair-value-page/per-neuron-pair-value-page.module'
        );
        return import(
          '../../ds-pages/per-neuron-pair-value-page/per-neuron-pair-value-page.component'
        ).then((x) => x.PerNeuronPairValuePageComponent);
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
      .pipe(withLatestFrom(this.viewing$), take(1))
      .subscribe(([params, viewing]) => {
        const reordered = { ...params };
        delete reordered['path'];
        reordered['ready'] = this.reorderedTabs;

        reordered['viewing'] = this.reorderedTabs.filter((x) =>
          viewing.find((v) => v.index == x)
        );

        this.router.navigate([
          'datastore',
          params['path'],
          'inspect',
          reordered,
        ]);
      });
  }

  createFirstOfType() {
    return (
      this.viewContainerRefs.changes as Observable<QueryList<ViewContainerRef>>
    ).pipe(
      delay(0),
      startWith(this.viewContainerRefs),
      delay(0),
      map((refs) => {
        const newMap = new Map<ViewContainerRef, ComponentRef<DsPage>>();
        const components = refs.map((r) => {
          newMap.set(r, this.compRefs.get(r));
          return this.compRefs.get(r).instance;
        });
        this.compRefs = newMap;
        const identifierSet = new Set<AdsIdentifier>();
        return components
          .filter((c) => {
            const res = !identifierSet.has(c.ads.identifier);
            identifierSet.add(c.ads.identifier);
            return res;
          })
          .map((c) => c.controls);
      })
    );
  }

  private subscribeGrouping() {
    this.store
      .select(routerSelectors.selectRouteParam('groupby'))
      .pipe(take(1))
      .subscribe((groupby) => {
        if (this.groupingCtrl.value != groupby && groupby) {
          this.groupingCtrl.setValue(groupby);
        }
      });

    this.groupingCtrl.valueChanges
      .pipe(
        startWith(this.groupingCtrl.value),
        withLatestFrom(this.store.select(routerSelectors.selectRouteParams)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([val, params]) => {
        const grouped: Params = { ...params, groupby: val };
        delete grouped['path'];
        this.router.navigate(['datastore', params['path'], 'inspect', grouped]);
      });
  }

  grouperFactory(key: string): GroupingFn {
    return (part) => part.data[key];
  }
}
