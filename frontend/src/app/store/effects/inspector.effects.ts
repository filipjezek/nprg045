import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import {
  setTabState,
  toggleSharedControls,
} from '../actions/inspector.actions';
import { filter, map, pairwise, switchMap, tap, withLatestFrom } from 'rxjs';
import { selectViewing } from '../selectors/inspector.selectors';
import { AdsIdentifier } from '../reducers/ads.reducer';

@Injectable()
export class InspectorEffects {
  shareControls$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(toggleSharedControls),
        filter(({ shared }) => shared),
        switchMap(() => this.store.select(selectViewing)),
        withLatestFrom(this.store.select((x) => x.inspector.tabs)),
        tap(([viewing, tabs]) => {
          const firsts = new Map<AdsIdentifier, number>();
          viewing.forEach((ds) => {
            if (firsts.has(ds.identifier)) {
              this.store.dispatch(
                setTabState({
                  index: ds.index,
                  state: tabs[firsts.get(ds.identifier)],
                })
              );
              return;
            }
            firsts.set(ds.identifier, ds.index);
          });
        })
      ),
    { dispatch: false }
  );

  unshareControls$ = createEffect(() =>
    this.store.select(selectViewing).pipe(
      pairwise(),
      filter(([first, sec]) => first.length >= 2 && sec.length < 2),
      map(() => toggleSharedControls({ shared: false }))
    )
  );

  constructor(private actions$: Actions, private store: Store<State>) {}
}
