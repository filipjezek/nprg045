import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { selectNodes } from 'src/app/store/actions/model.actions';
import {
  AdsIdentifier,
  PerNeuronValue,
} from 'src/app/store/reducers/ads.reducer';
import { State } from 'src/app/store/reducers';
import {
  selectAvailableValueNames,
  selectStimulus,
} from 'src/app/store/selectors/ads.selectors';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { RadioOption } from 'src/app/widgets/button-radio/button-radio.component';
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
  implements OnInit, AfterViewInit
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
    distinctUntilChanged(
      (prev, curr) => prev.min == curr.min && prev.max == curr.max
    ),
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

  constructor(
    private store: Store<State>,
    private fb: FormBuilder,
    private gEventS: GlobalEventService
  ) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.gEventS.escapePressed
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.store.dispatch(selectNodes({ nodes: [] }));
      });
  }
}
