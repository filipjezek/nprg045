import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  of,
  pluck,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { UnsubscribingComponent } from '../mixins/unsubscribing.mixin';
import { loadModel } from '../store/actions/model.actions';
import { AdsIdentifier, PerNeuronValue } from '../store/reducers/ads.reducer';
import { NetworkNode, State } from '../store/reducers/model.reducer';
import {
  selectAvailableValueNames,
  selectStimulus,
} from '../store/selectors/ads.selectors';
import { routerSelectors } from '../store/selectors/router.selectors';
import { RadioOption } from '../widgets/button-radio/button-radio.component';
import {
  EdgeDirection,
  PNVData,
} from './network-graph/network-graph.component';

@Component({
  selector: 'mozaik-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent
  extends UnsubscribingComponent
  implements OnInit
{
  edges: RadioOption[] = [
    { label: 'Incoming', value: EdgeDirection.incoming },
    { label: 'Outgoing', value: EdgeDirection.outgoing },
    { label: 'All', value: EdgeDirection.all },
  ];
  optionsForm = this.fb.nonNullable.group({
    edges: EdgeDirection.outgoing,
    pnv: this.fb.group({
      from: this.fb.control<number>(null),
      to: this.fb.control<number>(null),
    }),
  });

  selectedNodes: NetworkNode[] = [];
  hoveredNode: NetworkNode;

  datastore$ = this.store.select(routerSelectors.selectRouteParam('path'));
  model$ = this.store.select((x) => x.model.currentModel);
  displayedPnv$ = this.store.select(routerSelectors.selectRouteData).pipe(
    map((data) => data['ads'] as AdsIdentifier),
    switchMap((identifier) =>
      identifier !== AdsIdentifier.PerNeuronValue
        ? of(null)
        : combineLatest([
            this.store.select((x) => x.ads.selectedAds as PerNeuronValue[]),
            this.store.select(selectStimulus),
            this.store.select(routerSelectors.selectQueryParam('valueName')),
          ]).pipe(
            map(([ads, stimulus, valueName]) =>
              ads.filter(
                (a) =>
                  (a.stimulus === null || a.stimulus === stimulus) &&
                  a.valueName === valueName
              )
            )
          )
    )
  );
  pnvData$: Observable<Record<string, PNVData>> = combineLatest([
    this.displayedPnv$,
    this.model$,
  ]).pipe(
    map(([ads, model]) => {
      if (!ads || !model) return null;
      const separated: Record<string, PNVData> = {};
      for (const sheet in model.sheetNodes) {
        const sheetRelated = ads.filter((a) => a.sheet === sheet || !a.sheet);
        const values = new Map<number, number>();
        sheetRelated.forEach((a) =>
          a.ids.forEach((id, i) => values.set(id, a.values[i]))
        );
        separated[sheet] = {
          values,
          period: sheetRelated[0]?.period,
          unit:
            sheetRelated[0]?.unit === 'dimensionless'
              ? ''
              : sheetRelated[0]?.unit,
        };
      }
      return separated;
    }),
    shareReplay(1)
  );
  pnvRange$ = this.displayedPnv$.pipe(
    filter((x) => !!x),
    map((pnvs) => {
      const period = pnvs[0]?.period;
      if (period === null || period === undefined) {
        return {
          min: Math.min(...pnvs.flatMap((a) => a.values)),
          max: Math.max(...pnvs.flatMap((a) => a.values)),
        };
      }
      return { min: 0, max: period };
    }),
    distinctUntilKeyChanged('min'),
    distinctUntilKeyChanged('max'),
    tap((range) => {
      const fromCtrl = this.optionsForm.get(['pnv', 'from']);
      const toCtrl = this.optionsForm.get(['pnv', 'to']);
      setTimeout(() => {
        fromCtrl.setValue(range.min);
        toCtrl.setValue(range.max);
      });
    }),
    shareReplay(1)
  );
  pnvFilter$ = this.optionsForm.valueChanges.pipe(
    debounceTime(100),
    startWith(this.optionsForm.value),
    map((form) => form.pnv as { from: number; to: number }),
    distinctUntilChanged(
      (prev, curr) => prev?.from === curr?.from && prev?.to === curr?.to
    )
  );

  pnvValueNames$ = this.store.select(selectAvailableValueNames);

  constructor(private store: Store<State>, private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.datastore$
      .pipe(
        filter((x) => !!x),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe((path) => {
        this.store.dispatch(loadModel({ path }));
      });
  }
}
