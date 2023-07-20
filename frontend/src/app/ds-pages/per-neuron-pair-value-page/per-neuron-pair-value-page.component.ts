import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Unsubscribing } from 'src/app/mixins/unsubscribing.mixin';
import { DsPage, DsPageConstructor } from '../common/ds-page';
import { PerNeuronPairValue } from 'src/app/store/reducers/ads.reducer';
import { TabState } from 'src/app/store/reducers/inspector.reducer';
import { RadioOption } from 'src/app/widgets/button-radio/button-radio.component';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { FormBuilder } from '@angular/forms';
import { roundFloat } from 'src/app/utils/round-float';
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
import { Extent } from '../common/scale/scale.component';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { isEqual } from 'lodash-es';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { HistogramData } from '../common/histogram/histogram.component';
import * as d3 from 'd3';

type PNPVVisualization = 'matrix' | 'histogram';
export interface PNPVTabState extends TabState {
  pnpv: {
    min: number;
    max: number;
  };
  includeIdentity: boolean;
  visualization: PNPVVisualization;
  thresholds: number;
}

@Component({
  selector: 'mozaik-per-neuron-pair-value-page',
  templateUrl: './per-neuron-pair-value-page.component.html',
  styleUrls: ['./per-neuron-pair-value-page.component.scss'],
})
export class PerNeuronPairValuePageComponent
  extends Unsubscribing(
    DsPage as DsPageConstructor<PerNeuronPairValue, PNPVTabState>
  )
  implements OnInit
{
  @ViewChild('controls') public controls: TemplateRef<any>;

  visualizations: RadioOption[] = [
    { label: 'Matrix', value: 'matrix' },
    { label: 'Histogram', value: 'histogram' },
  ];
  optionsForm = this.fb.nonNullable.group({
    pnpv: this.fb.nonNullable.group({
      min: 0,
      max: 0,
    }),
    includeIdentity: true,
    visualization: 'matrix',
    thresholds: 1,
  });

  extent$: Observable<Extent>;
  filter$: Observable<Extent>;
  thresholds$: Observable<number>;
  histogramData$: Observable<HistogramData>;

  constructor(store: Store<State>, private fb: FormBuilder) {
    super(store);
  }

  ngOnInit(): void {
    this.extent$ = this.createExtent();
    super.ngOnInit();
    this.subscribeForm();
    this.filter$ = this.createFilter();
    this.histogramData$ = this.createHistogramData();
    this.thresholds$ = this.createThresholds();
  }

  protected override initTabState(): void {
    this.extent$.pipe(take(1)).subscribe((extent) => {
      this.store.dispatch(
        setTabState({
          index: this.ads.index,
          state: {
            pnpv: { ...extent },
            visualization: 'matrix',
            // thresholds can be set correctly only when we receive full pnv data, which is too late to init tab state
            thresholds: 1,
            includeIdentity: true,
          } as PNPVTabState,
        })
      );
    });
  }

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
            filter((state) => state && !isEqual(state, this.optionsForm.value)),
            takeUntil(this.onDestroy$)
          )
          .subscribe((state) => {
            this.optionsForm.setValue(state);
          });
        this.optionsForm.valueChanges
          .pipe(
            startWith(this.optionsForm.value),
            pairwise(),
            // debounce to avoid heavy computation when user is dragging the slider
            debounce(([one, two]) =>
              one.pnpv.max == two.pnpv.max &&
              one.pnpv.min == two.pnpv.min &&
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
                    state: val as PNPVTabState,
                  })
                )
              );
            } else {
              this.store.dispatch(
                setTabState({
                  index: this.ads.index,
                  state: val as PNPVTabState,
                })
              );
            }
          });
      });
  }

  private createFilter() {
    return this.tabState$.pipe(
      filter((x) => !!x),
      map((state) => state.pnpv as Required<Extent>),
      distinctUntilChanged(
        (prev, curr) => prev?.min === curr?.min && prev?.max === curr?.max
      )
    );
  }
  private createExtent() {
    return combineLatest([
      this.fullAds$.pipe(filter((ds) => !!ds)),
      this.sharedControls$,
      this.store.select(
        inspectorSelectors.selectSameTypeViewing(this.ads.index)
      ),
      this.optionsForm
        .get('includeIdentity')
        .valueChanges.pipe(startWith(true)),
    ]).pipe(
      map(([pnpv, shared, all, includeIdentity]) => {
        const period = (shared ? all[0] : pnpv)?.period;
        const filterIdentity = (row: number[], i: number) =>
          includeIdentity ? row : row.filter((_, j) => i != j);
        if (period === null || period === undefined) {
          const structures =
            shared && pnpv === all[0] ? (all as PerNeuronPairValue[]) : [pnpv];
          return {
            min: Math.min(
              ...structures.map((ds) =>
                Math.min(
                  ...ds.values.map((row, i) =>
                    Math.min(...filterIdentity(row, i))
                  )
                )
              )
            ),
            max: Math.max(
              ...structures.map((ds) =>
                Math.max(
                  ...ds.values.map((row, i) =>
                    Math.max(...filterIdentity(row, i))
                  )
                )
              )
            ),
          };
        }
        return { min: 0, max: period };
      }),
      tap((range) => {
        const fromCtrl = this.optionsForm.get(['pnpv', 'min'] as const);
        const toCtrl = this.optionsForm.get(['pnpv', 'max'] as const);
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
    return combineLatest([
      this.fullAds$.pipe(filter((x) => !!x)),
      this.filter$,
    ]).pipe(
      map(([ds, filter]: [PerNeuronPairValue, Extent]) => {
        let values = ds.values.flatMap((row) =>
          row.filter((x) => x >= filter.min && x <= filter.max)
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
              state: {
                ...state,
                thresholds: d3.thresholdSturges(
                  ds.values.flatMap((row) => row)
                ),
              },
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

  roundFloat = roundFloat;
}
