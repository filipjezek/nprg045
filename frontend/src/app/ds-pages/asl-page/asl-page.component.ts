import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Unsubscribing } from 'src/app/mixins/unsubscribing.mixin';
import { AnalogSignalList } from 'src/app/store/reducers/ads.reducer';
import { TabState } from 'src/app/store/reducers/inspector.reducer';
import { DsPage, DsPageConstructor } from '../common/ds-page';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { FormBuilder } from '@angular/forms';
import { GlobalEventService } from 'src/app/services/global-event.service';
import {
  combineLatestWith,
  filter,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import { selectNodes } from 'src/app/store/actions/model.actions';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { isEqual } from 'lodash-es';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { RadioOption } from 'src/app/widgets/button-radio/button-radio.component';
import { EdgeDirection } from '../common/network-graph/network-graph.component';

export interface AslTabState extends TabState {
  edges: EdgeDirection;
  visibility: {
    showArrows: boolean;
    highTransparency: boolean;
  };
}

@Component({
  selector: 'mozaik-asl-page',
  templateUrl: './asl-page.component.html',
  styleUrls: ['./asl-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AslPageComponent
  extends Unsubscribing(
    DsPage as DsPageConstructor<AnalogSignalList, AslTabState>
  )
  implements OnInit, AfterViewInit
{
  @ViewChild('controls') public controls: TemplateRef<any>;
  edges: RadioOption[] = [
    { label: 'Incoming', value: EdgeDirection.incoming },
    { label: 'Outgoing', value: EdgeDirection.outgoing },
    { label: 'All', value: EdgeDirection.all },
  ];
  optionsForm = this.fb.nonNullable.group({
    edges: EdgeDirection.outgoing,
    visibility: this.fb.nonNullable.group({
      showArrows: true,
      highTransparency: false,
    }),
  });

  allNodes$ = this.store.select((x) => x.model.currentModel.nodes);
  dsNodes$ = this.fullAds$.pipe(
    filter((x) => !!x),
    combineLatestWith(this.allNodes$),
    map(([ds, all]) => ds.ids.map((id) => all[id]))
  );
  selected$ = this.store.select((x) => x.model.selected);

  constructor(
    store: Store<State>,
    private fb: FormBuilder,
    private gEventS: GlobalEventService
  ) {
    super(store);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscribeForm();
  }

  ngAfterViewInit(): void {
    this.gEventS.escapePressed
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.store.dispatch(selectNodes({ nodes: [] }));
      });
  }

  protected override initTabState(): void {
    this.store.dispatch(
      setTabState({
        index: this.ads.index,
        state: {
          edges: EdgeDirection.outgoing,
          visibility: {
            highTransparency: false,
            showArrows: true,
          },
        } as AslTabState,
      })
    );
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
                    state: val as AslTabState,
                  })
                )
              );
            } else {
              this.store.dispatch(
                setTabState({
                  index: this.ads.index,
                  state: val as AslTabState,
                })
              );
            }
          });
      });
  }
}
