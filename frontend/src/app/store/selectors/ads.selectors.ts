import { createSelector } from '@ngrx/store';
import { State } from '../reducers';
import { selectQueryParam } from './router.selectors';

export const selectStimulus = createSelector(
  selectQueryParam('stimulus'),
  (x: State) => x.ads.selectedAds,
  (index, ads) => {
    const stimuli = Array.from(new Set(ads.map((a) => a.stimulus)));
    stimuli.sort();
    return stimuli[+index];
  }
);
