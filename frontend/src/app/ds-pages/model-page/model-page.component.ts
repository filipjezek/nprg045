import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  Observable,
  combineLatest,
  debounce,
  distinctUntilChanged,
  filter,
  first,
  interval,
  map,
  of,
  pairwise,
  shareReplay,
  startWith,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { Unsubscribing } from 'src/app/mixins/unsubscribing.mixin';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { selectNodes } from 'src/app/store/actions/model.actions';
import {
  AdsIdentifier,
  PerNeuronValue,
} from 'src/app/store/reducers/ads.reducer';
import { State } from 'src/app/store/reducers';
import { RadioOption } from 'src/app/widgets/button-radio/button-radio.component';
import {
  EdgeDirection,
  PNVData,
} from './network-graph/network-graph.component';
import { DsPage, DsPageConstructor } from '../common/ds-page';
import { TabState } from 'src/app/store/reducers/inspector.reducer';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { isEqual } from 'lodash-es';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { HistogramData } from '../common/histogram/histogram.component';
import * as d3 from 'd3';
import { Extent } from '../common/scale/scale.component';
import { roundFloat } from 'src/app/utils/round-float';

type PNVVisualization = 'scatterplot' | 'histogram';

export interface ModelTabState extends TabState {
  edges: EdgeDirection;
  pnv: {
    min: number;
    max: number;
  };
  visualization: PNVVisualization;
  thresholds: number;
}

@Component({
  selector: 'mozaik-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent
  extends Unsubscribing(
    DsPage as DsPageConstructor<PerNeuronValue, ModelTabState>
  )
  implements OnInit, AfterViewInit
{
  @ViewChild('controls') public controls: TemplateRef<any>;

  edges: RadioOption[] = [
    { label: 'Incoming', value: EdgeDirection.incoming },
    { label: 'Outgoing', value: EdgeDirection.outgoing },
    { label: 'All', value: EdgeDirection.all },
  ];
  visualizations: RadioOption[] = [
    { label: 'Scatterplot', value: 'scatterplot' },
    { label: 'Histogram', value: 'histogram' },
  ];
  optionsForm = this.fb.nonNullable.group({
    edges: EdgeDirection.outgoing,
    pnv: this.fb.nonNullable.group({
      min: 0,
      max: 0,
    }),
    visualization: 'scatterplot',
    thresholds: 1,
  });

  model$ = this.store.select((x) => x.model.currentModel);
  pnvData$: Observable<PNVData> = this.fullAds$.pipe(
    map((ds) => {
      if (ds?.identifier !== AdsIdentifier.PerNeuronValue) return null;
      const values = new Map<number, number>();
      ds.ids.forEach((id, i) => values.set(id, ds.values[i]));
      return { period: ds.period, unit: ds.unit, values };
    }),
    takeUntil(this.onDestroy$),
    shareReplay(1)
  );
  pnvExtent$: Observable<Extent>;
  pnvFilter$: Observable<Extent>;
  thresholds$: Observable<number>;
  histogramData$: Observable<HistogramData>;

  constructor(
    store: Store<State>,
    private fb: FormBuilder,
    private gEventS: GlobalEventService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.pnvExtent$ = this.createExtent();
    super.ngOnInit();
    this.subscribeForm();
    this.pnvFilter$ = this.createFilter();
    this.histogramData$ = this.createHistogramData();
    this.thresholds$ = this.createThresholds();
  }

  ngAfterViewInit(): void {
    this.gEventS.escapePressed
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.store.dispatch(selectNodes({ nodes: [] }));
      });
  }

  protected override initTabState(): void {
    if (this.ads.identifier === AdsIdentifier.PerNeuronValue) {
      this.pnvExtent$.pipe(take(1)).subscribe((extent) => {
        this.store.dispatch(
          setTabState({
            index: this.ads.index,
            state: {
              edges: EdgeDirection.outgoing,
              pnv: { ...extent },
              visualization: 'scatterplot',
              // thresholds can be set correctly only when we receive full pnv data, which is too late to init tab state
              thresholds: 1,
            } as ModelTabState,
          })
        );
      });
    } else {
      this.store.dispatch(
        setTabState({
          index: this.ads.index,
          state: {
            edges: EdgeDirection.outgoing,
            pnv: { min: 0, max: 0 },
            visualization: 'scatterplot',
            thresholds: 1,
          } as ModelTabState,
        })
      );
    }
  }

  roundFloat = roundFloat;

  private subscribeForm() {
    this.tabState$
      .pipe(
        filter((x) => !!x),
        take(1),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.tabState$
          .pipe(
            filter((state) => !isEqual(state, this.optionsForm.value)),
            takeUntil(this.onDestroy$)
          )
          .subscribe((state) => {
            this.optionsForm.setValue(state);
          });
        this.optionsForm.valueChanges
          .pipe(
            startWith(this.optionsForm.value),
            pairwise(),
            debounce(([one, two]) =>
              one.pnv.max == two.pnv.max &&
              one.pnv.min == two.pnv.min &&
              one.thresholds == two.thresholds
                ? of(1)
                : interval(100)
            ),
            map(([one, two]) => two),
            withLatestFrom(
              this.sharedControls$,
              this.store.select(
                inspectorSelectors.selectSameTypeViewing(this.ads.index)
              )
            ),
            takeUntil(this.onDestroy$)
          )
          .subscribe(([val, shared, all]) => {
            if (shared && all[0].index == this.ads.index) {
              all.forEach((ds) =>
                this.store.dispatch(
                  setTabState({
                    index: ds.index,
                    state: val as ModelTabState,
                  })
                )
              );
            } else {
              this.store.dispatch(
                setTabState({
                  index: this.ads.index,
                  state: val as ModelTabState,
                })
              );
            }
          });
      });
  }
  private createFilter() {
    return this.tabState$.pipe(
      filter((x) => !!x),
      map((state) => state.pnv as Required<Extent>),
      distinctUntilChanged(
        (prev, curr) => prev?.min === curr?.min && prev?.max === curr?.max
      )
    );
  }
  private createExtent() {
    return combineLatest([
      this.fullAds$.pipe(
        filter((x) => x?.identifier === AdsIdentifier.PerNeuronValue)
      ),
      this.sharedControls$,
      this.store.select(
        inspectorSelectors.selectSameTypeViewing(this.ads.index)
      ),
    ]).pipe(
      map(([pnv, shared, all]) => {
        const period = (shared ? all[0] : pnv)?.period;
        if (period === null || period === undefined) {
          return shared && pnv === all[0]
            ? {
                min: Math.min(
                  ...(all as PerNeuronValue[]).map((ds) =>
                    Math.min(...ds.values)
                  )
                ),
                max: Math.max(
                  ...(all as PerNeuronValue[]).map((ds) =>
                    Math.max(...ds.values)
                  )
                ),
              }
            : {
                min: Math.min(...pnv.values),
                max: Math.max(...pnv.values),
              };
        }
        return { min: 0, max: period };
      }),
      tap((range) => {
        const fromCtrl = this.optionsForm.get(['pnv', 'min'] as const);
        const toCtrl = this.optionsForm.get(['pnv', 'max'] as const);
        setTimeout(() => {
          if (fromCtrl.value < range.min) {
            fromCtrl.setValue(range.min);
          }
          if (toCtrl.value > range.max) {
            toCtrl.setValue(range.max);
          }
        });
      }),
      takeUntil(this.onDestroy$),
      shareReplay(1)
    );
  }
  private createHistogramData() {
    return combineLatest([this.fullAds$, this.pnvFilter$]).pipe(
      map(([ds, filter]: [PerNeuronValue, Extent]) => {
        let values = ds.values.filter(
          (x) => x >= filter.min && x <= filter.max
        );
        if (ds.period) {
          values = values.map((x) => x % ds.period);
        }
        return {
          values,
          period: ds.period,
          unit: ds.unit,
        };
      }),
      takeUntil(this.onDestroy$),
      shareReplay(1)
    );
  }
  private createThresholds() {
    this.tabState$
      .pipe(
        first((ds) => !!ds),
        withLatestFrom(this.fullAds$)
      )
      .subscribe(([state, ds]) => {
        if (state.thresholds == 1) {
          this.store.dispatch(
            setTabState({
              index: ds.index,
              state: { thresholds: d3.thresholdSturges(ds.values) },
            })
          );
        }
      });
    return this.tabState$.pipe(
      filter((x) => !!x),
      map((x) => x.thresholds),
      distinctUntilChanged()
    );
  }
}
