import { createSelector } from '@ngrx/store';
import { State } from '../reducers';
import { Ads, PerNeuronValue } from '../reducers/ads.reducer';
import { selectQueryParam } from './router.selectors';

export function getSortedStimuli(ads: Ads[]) {
  const stimuli = Array.from(new Set(ads.map((a) => a.stimulus)));
  stimuli.sort();
  return stimuli;
}

export function getValueNames(ads: PerNeuronValue[], stimulus: string) {
  return new Set(
    ads
      .filter((a) => a.stimulus === stimulus || a.stimulus === null)
      .map((a) => a.valueName)
  );
}

export const selectStimulus = createSelector(
  selectQueryParam('stimulus'),
  (x: State) => x.ads.selectedAds,
  (index, ads) => {
    return getSortedStimuli(ads)[+index];
  }
);

export const selectAvailableValueNames = createSelector(
  selectStimulus,
  (x: State) => x.ads.selectedAds as PerNeuronValue[],
  (stimulus, ads) => {
    const arr = Array.from(getValueNames(ads, stimulus));
    arr.sort();
    return arr;
  }
);
