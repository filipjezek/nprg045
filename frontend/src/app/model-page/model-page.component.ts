import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  of,
  share,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { UnsubscribingComponent } from '../mixins/unsubscribing.mixin';
import { loadModel } from '../store/actions/model.actions';
import { AdsIdentifier, PerNeuronValue } from '../store/reducers/ads.reducer';
import { NetworkNode, State } from '../store/reducers/model.reducer';
import { selectStimulus } from '../store/selectors/ads.selectors';
import {
  selectQueryParam,
  selectRouteData,
  selectRouteParam,
} from '../store/selectors/router.selectors';
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

  datastore$ = this.store.select(selectRouteParam('path'));
  model$ = this.store.select((x) => x.model.currentModel);
  pnvData$: Observable<PNVData> = this.store.select(selectRouteData).pipe(
    map((data) => data['ads'] as AdsIdentifier),
    switchMap((identifier) =>
      identifier !== AdsIdentifier.PerNeuronValue
        ? of(null)
        : combineLatest([
            this.optionsForm.valueChanges.pipe(
              startWith(this.optionsForm.value)
            ),
            combineLatest([
              this.store.select((x) => x.ads.selectedAds as PerNeuronValue[]),
              this.store.select(selectStimulus),
            ]).pipe(
              map(([ads, stimulus]) => {
                const merged: number[] = [];
                for (const a of ads) {
                  a.ids.forEach((id, i) => {
                    if (a.stimulus === null || a.stimulus === stimulus) {
                      merged[id] = a.values[i];
                    }
                  });
                }
                return {
                  values: merged,
                  period: ads.find(
                    (a) => a.stimulus === null || a.stimulus === stimulus
                  )?.period,
                };
              })
            ),
          ]).pipe(
            map(([form, pnv]) => ({
              ...pnv,
              from: form.pnv.from,
              to: form.pnv.to,
            }))
          )
    )
  );
  pnvDetail$: Observable<PerNeuronValue> = this.store
    .select(selectRouteData)
    .pipe(
      map((data) => data['ads'] as AdsIdentifier),
      switchMap((identifier) =>
        identifier !== AdsIdentifier.PerNeuronValue
          ? of(null)
          : combineLatest([
              this.store.select((x) => x.ads.selectedAds as PerNeuronValue[]),
              this.store.select(selectStimulus),
            ]).pipe(
              map(([ads, stimulus]) =>
                ads.find((a) => a.stimulus === null || a.stimulus === stimulus)
              )
            )
      )
    );
  pnvRange$ = this.pnvData$.pipe(
    filter((x) => !!x),
    map(({ values, period }) => {
      if (period === null || period === undefined) {
        return {
          from: Math.min(...values.filter((x) => typeof x === 'number')),
          to: Math.max(...values.filter((x) => typeof x === 'number')),
        };
      }
      return { from: 0, to: period };
    }),
    distinctUntilKeyChanged('from'),
    distinctUntilKeyChanged('to'),
    tap((range) => {
      const fromCtrl = this.optionsForm.get(['pnv', 'from']);
      const toCtrl = this.optionsForm.get(['pnv', 'to']);
      setTimeout(() => {
        fromCtrl.setValue(range.from);
        toCtrl.setValue(range.to);
      });
    }),
    shareReplay(1)
  );

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
