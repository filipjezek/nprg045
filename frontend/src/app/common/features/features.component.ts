import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { selectRouteParam } from 'src/app/store/selectors/router.selectors';

export interface Labelled<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'mozaik-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesComponent implements OnInit {
  datastore$ = this.store.select(selectRouteParam('path'));
  staticLinks: Labelled<string[]>[] = [{ label: 'Model', value: ['model'] }];
  ads$ = this.store.select((x) => x.ads.allAds);
  stimuli$ = this.store
    .select((x) =>
      Array.from(
        new Set(
          x.ads.selectedAds.map((a) => a.stimulus).filter((x) => x !== null)
        )
      )
    )
    .pipe(tap((stimuli) => stimuli.sort()));

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}
}
