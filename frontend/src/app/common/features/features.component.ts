import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
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
  links: Labelled<string[]>[] = [{ label: 'Model', value: ['model'] }];

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}
}
