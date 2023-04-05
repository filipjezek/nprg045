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
  takeUntil,
  tap,
} from 'rxjs';
import { Unsubscribing } from 'src/app/mixins/unsubscribing.mixin';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { selectNodes } from 'src/app/store/actions/model.actions';
import { PerNeuronValue } from 'src/app/store/reducers/ads.reducer';
import { State } from 'src/app/store/reducers';
import { RadioOption } from 'src/app/widgets/button-radio/button-radio.component';
import {
  EdgeDirection,
  PNVData,
} from './network-graph/network-graph.component';
import { DsPage, DsPageConstructor } from '../ds-page';

@Component({
  selector: 'mozaik-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent
  extends Unsubscribing(DsPage as DsPageConstructor<PerNeuronValue>)
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
  pnvData$: Observable<PNVData> = this.fullAds$.pipe(
    map((ds) => {
      if (!ds) return ds as any;
      const values = new Map<number, number>();
      ds.ids.forEach((id, i) => values.set(id, ds.values[i]));
      return { period: ds.period, unit: ds.unit, values };
    })
  );
  pnvRange$ = this.fullAds$.pipe(
    filter((x) => !!x),
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

  constructor(
    store: Store<State>,
    private fb: FormBuilder,
    private gEventS: GlobalEventService
  ) {
    super(store);
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
