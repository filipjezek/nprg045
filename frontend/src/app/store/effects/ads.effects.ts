import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  switchMap,
  catchError,
  map,
  withLatestFrom,
  distinctUntilKeyChanged,
  filter,
} from 'rxjs/operators';
import { merge, of } from 'rxjs';
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
  specificAdsLoaded,
} from '../actions/ads.actions';
import { selectRouteParam } from '../selectors/router.selectors';

@Injectable()
export class AdsEffects {
  datastoreChanged$ = this.store.select(selectRouteParam('path')).pipe(
    filter((x) => !!x),
    map((path) => ({ path }))
  );

  loadingOverlayInc$ = createEffect(() =>
    merge(
      this.datastoreChanged$,
      this.actions$.pipe(ofType(loadAds, loadSpecificAds))
    ).pipe(map(() => loadingOverlayIncrement()))
  );

  loadAds$ = createEffect(() =>
    merge(this.actions$.pipe(ofType(loadAds)), this.datastoreChanged$).pipe(
      distinctUntilKeyChanged('path'),
      switchMap(({ path }) =>
        this.adsS.loadAds(path).pipe(
          map((ads) => AdsLoaded({ ads })),
          catchError((err: HttpErrorResponse) => {
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
          withLatestFrom(this.store.select((x) => x.ads.allAds[index]))
        )
      ),
      switchMap(([path, thumb]) =>
        this.adsS
          .loadSpecificAds(path, thumb.identifier, thumb.algorithm, thumb.tags)
          .pipe(
            map((ads) => specificAdsLoaded({ ads })),
            catchError((err: HttpErrorResponse) => {
              this.toastS.add(new Toast('Failed to load data structures'));
              return of(apiError({ error: err }));
            })
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
    private adsS: AdsService
  ) {}
}
