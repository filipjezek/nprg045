import { createAction, props } from '@ngrx/store';
import { Ads, AdsThumb } from '../reducers/ads.reducer';

export const loadAds = createAction(
  '[root] load data structures',
  props<{ path: string }>()
);
export const AdsLoaded = createAction(
  '[ads API] data structures loaded',
  props<{ ads: AdsThumb[] }>()
);
export const loadSpecificAds = createAction(
  '[analysis page] load specific data structure',
  props<{ path: string; index: number }>()
);
export const specificAdsLoaded = createAction(
  '[ads API] specific data structure loaded',
  props<{ ads: Ads[] }>()
);
export const apiError = createAction(
  '[ads API] error',
  props<{ error: any }>()
);