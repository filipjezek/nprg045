import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  switchMap,
  catchError,
  map,
  withLatestFrom,
  distinctUntilKeyChanged,
  filter,
  distinctUntilChanged,
  delayWhen,
  pairwise,
  tap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { ToastService } from 'src/app/widgets/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  loadingOverlayDecrement,
  loadingOverlayIncrement,
} from '../actions/ui.actions';
import { Toast } from 'src/app/widgets/services/toast';
import { AdsService } from 'src/app/services/ads.service';
import {
  AdsLoaded,
  apiError,
  loadAds,
  loadSpecificAds,
  removeFromSelectedAds,
  specificAdsLoaded,
} from '../actions/ads.actions';
import { routerSelectors } from '../selectors/router.selectors';
import { Router } from '@angular/router';
import { difference } from 'lodash-es';
import { closeTab } from '../actions/inspector.actions';

@Injectable()
export class AdsEffects {
  datastoreChanged$ = createEffect(() =>
    this.store.select(routerSelectors.selectRouteParam('path')).pipe(
      filter((x) => !!x),
      distinctUntilChanged(),
      map((path) => loadAds({ path }))
    )
  );
  adsSelected$ = createEffect(() =>
    this.store.select(routerSelectors.selectRouteParam('adsIndex')).pipe(
      filter((x) => !!x), // okay, because it is a string
      distinctUntilChanged(),
      withLatestFrom(
        this.store.select(routerSelectors.selectRouteParam('path'))
      ),
      map(([index, path]) => loadSpecificAds({ index: +index, path }))
    )
  );

  loadingOverlayInc$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAds, loadSpecificAds),
      map(() => loadingOverlayIncrement())
    )
  );

  tabClosed$ = createEffect(
    () =>
      this.store.select(routerSelectors.selectRouteParam('ready')).pipe(
        map((p) => (p ? p.split(',') : [])),
        pairwise(),
        filter(([first, second]) => first.length > second.length),
        tap(([first, second]) => {
          const diff: string[] = difference(first, second);
          diff.forEach((index) => {
            const parsed = +index;
            this.store.dispatch(removeFromSelectedAds({ index: parsed }));
            this.store.dispatch(closeTab({ index: parsed }));
          });
        })
      ),
    { dispatch: false }
  );

  loadAds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAds),
      distinctUntilKeyChanged('path'),
      switchMap(({ path }) =>
        this.adsS.loadAds(path).pipe(
          map((ads) =>
            AdsLoaded({ ads: ads.map((a, i) => ({ ...a, index: i })) })
          ),
          catchError((err: HttpErrorResponse) => {
            console.log(err);
            this.toastS.add(new Toast('Failed to load data structures'));
            return of(apiError({ error: err }));
          })
        )
      )
    )
  );
  loadSpecificAds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSpecificAds),
      switchMap(({ path, index }) =>
        of(path).pipe(
          delayWhen(() =>
            this.store
              .select((x) => x.ads.allAds)
              .pipe(filter((ads) => ads.length > index))
          ),
          withLatestFrom(this.store.select((x) => x.ads.allAds[index])),
          switchMap(([path, thumb]) =>
            this.adsS.loadSpecificAds(path, thumb).pipe(
              map((ads) => {
                return specificAdsLoaded({ ads: { ...ads, index } });
              }),
              catchError((err: HttpErrorResponse) => {
                console.log(err);
                this.toastS.add(new Toast('Failed to load data structures'));
                return of(apiError({ error: err }));
              })
            )
          )
        )
      )
    )
  );

  loadingOverlayDec$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdsLoaded, specificAdsLoaded, apiError),
      map(() => loadingOverlayDecrement())
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private toastS: ToastService,
    private adsS: AdsService,
    private router: Router
  ) {}
}
