import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
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
  Extent,
  PNVData,
} from './network-graph/network-graph.component';
import { DsPage, DsPageConstructor } from '../common/ds-page';
import { TabState } from 'src/app/store/reducers/inspector.reducer';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { isEqual } from 'lodash-es';

export interface ModelTabState extends TabState {
  edges: EdgeDirection;
  pnv: {
    min: number;
    max: number;
  };
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
  edges: RadioOption[] = [
    { label: 'Incoming', value: EdgeDirection.incoming },
    { label: 'Outgoing', value: EdgeDirection.outgoing },
    { label: 'All', value: EdgeDirection.all },
  ];
  optionsForm = this.fb.nonNullable.group({
    edges: EdgeDirection.outgoing,
    pnv: this.fb.nonNullable.group({
      min: 0,
      max: 0,
    }),
  });

  model$ = this.store.select((x) => x.model.currentModel);
  pnvData$: Observable<PNVData> = this.fullAds$.pipe(
    map((ds) => {
      if (ds?.identifier !== AdsIdentifier.PerNeuronValue) return null;
      const values = new Map<number, number>();
      ds.ids.forEach((id, i) => values.set(id, ds.values[i]));
      return { period: ds.period, unit: ds.unit, values };
    }),
    shareReplay(1)
  );
  pnvExtent$ = this.fullAds$.pipe(
    filter((x) => x?.identifier === AdsIdentifier.PerNeuronValue),
    map((pnv) => {
      const period = pnv?.period;
      if (period === null || period === undefined) {
        return {
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
    shareReplay(1)
  );
  pnvFilter$: Observable<Extent>;

  constructor(
    store: Store<State>,
    private fb: FormBuilder,
    private gEventS: GlobalEventService
  ) {
    super(store);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.optionsForm.valueChanges
      .pipe(
        debounceTime(100),
        withLatestFrom(this.tabState$),
        filter(([val, state]) => !isEqual(val, state)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([val]) => {
        this.store.dispatch(
          setTabState({ index: this.ads.index, state: val as ModelTabState })
        );
      });
    this.tabState$
      .pipe(
        filter((x) => !!x),
        take(1),
        takeUntil(this.onDestroy$)
      )
      .subscribe((state) => {
        this.optionsForm.setValue(state);
      });
    this.pnvFilter$ = this.optionsForm.valueChanges.pipe(
      debounceTime(100),
      startWith(this.optionsForm.value),
      map((form) => form.pnv as Required<Extent>),
      distinctUntilChanged(
        (prev, curr) => prev?.min === curr?.min && prev?.max === curr?.max
      ),
      shareReplay(1)
    );
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
      this.pnvExtent$.pipe(take(1)).subscribe((extent) =>
        this.store.dispatch(
          setTabState({
            index: this.ads.index,
            state: {
              edges: EdgeDirection.outgoing,
              pnv: { ...extent },
            } as ModelTabState,
          })
        )
      );
    } else {
      this.store.dispatch(
        setTabState({
          index: this.ads.index,
          state: {
            edges: EdgeDirection.outgoing,
            pnv: { min: 0, max: 0 },
          } as ModelTabState,
        })
      );
    }
  }

  /**
   * the number input element rounds min and max - we will intentionally set
   * min and max a little wider to allow the user to select all the required values
   */
  roundFloat(x: Number, dir: 'up' | 'down') {
    if (x === undefined || x === null) return 0;
    if (Number.isNaN(x) || !Number.isFinite(x)) return +x;
    const mantissaPrecision = Math.pow(10, 14);

    let [mantissa, exponent] = x
      .toExponential()
      .split('e')
      .map((n) => +n);
    mantissa =
      Math[dir == 'down' ? 'floor' : 'ceil'](mantissa * mantissaPrecision) /
      mantissaPrecision;
    return mantissa * Math.pow(10, exponent);
  }
}
