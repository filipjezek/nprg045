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
  tap,
  delayWhen,
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
  clearSelectedAds,
  loadAds,
  loadSpecificAds,
  specificAdsLoaded,
} from '../actions/ads.actions';
import { routerSelectors } from '../selectors/router.selectors';
import { Router } from '@angular/router';
import { Ads, AdsIdentifier, PerNeuronValue } from '../reducers/ads.reducer';
import { getSortedStimuli, getValueNames } from '../selectors/ads.selectors';

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
  adsClear$ = createEffect(() =>
    this.store.select(routerSelectors.selectRouteParam('adsIndex')).pipe(
      distinctUntilChanged(),
      filter((x) => !x), // okay, because it is a string
      map(() => clearSelectedAds())
    )
  );

  loadingOverlayInc$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAds, loadSpecificAds),
      map(() => loadingOverlayIncrement())
    )
  );

  loadAds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAds),
      distinctUntilKeyChanged('path'),
      switchMap(({ path }) =>
        this.adsS.loadAds(path).pipe(
          map((ads) => AdsLoaded({ ads })),
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
          withLatestFrom(this.store.select((x) => x.ads.allAds[index]))
        )
      ),
      switchMap(([path, thumb]) =>
        this.adsS
          .loadSpecificAds(path, thumb.identifier, thumb.algorithm, thumb.tags)
          .pipe(
            tap((ads) => this.prepareQueryParams(ads)),
            map((ads) => {
              return specificAdsLoaded({ ads });
            }),
            catchError((err: HttpErrorResponse) => {
              console.log(err);
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
    private adsS: AdsService,
    private router: Router
  ) {}

  private prepareQueryParams(ads: Ads[]) {
    if (!ads.length) return;
    const qParams = this.router.routerState.snapshot.root.queryParams;
    const newParams: Record<string, string | number> = {};
    const stimuli = getSortedStimuli(ads);
    if (
      (!qParams['stimulus'] || stimuli.length <= +qParams['stimulus']) &&
      ads.find((a) => a.stimulus !== null)
    ) {
      newParams['stimulus'] = 0;
    }
    const stimulus =
      stimuli[
        'stimulus' in newParams ? +newParams['stimulus'] : +qParams['stimulus']
      ] || null;

    if (ads[0].identifier === AdsIdentifier.PerNeuronValue) {
      const valueNames = getValueNames(ads as PerNeuronValue[], stimulus);
      if (!qParams['valueName'] || !valueNames.has(qParams['valueName'])) {
        let min: string = undefined;
        valueNames.forEach((val) => {
          if (min === undefined || val < min) min = val;
        });
        newParams['valueName'] = min;
      }
    }
    this.router.navigate([], {
      queryParams: newParams,
      queryParamsHandling: 'merge',
    });
  }
}
