import { createAction, props } from '@ngrx/store';
import { Ads } from '../reducers/ads.reducer';

export const loadAds = createAction(
  '[root] load data structures',
  props<{ path: string }>()
);
export const AdsLoaded = createAction(
  '[ads API] data structures loaded',
  props<{ ads: Ads[] }>()
);
export const loadSpecificAds = createAction(
  '[analysis page] load specific data structure',
  props<{ path: string; index: number }>()
);
export const specificAdsLoaded = createAction(
  '[ads API] specific data structure loaded',
  props<{ ads: Ads }>()
);
export const clearSelectedAds = createAction('[root] clear selected ads');
export const removeFromSelectedAds = createAction(
  '[ds inspector] remove from selected ads',
  props<{ index: number }>()
);
export const apiError = createAction(
  '[ads API] error',
  props<{ error: any }>()
);
export const adsLoadingProgress = createAction(
  '[ads API] ads loading progress',
  props<{ current: number; index: number; path: string }>()
);
export const initAdsLoadingProgress = createAction(
  '[ads service] init ads loading progress',
  props<{ index: number; parts: Record<string, number> }>()
);
