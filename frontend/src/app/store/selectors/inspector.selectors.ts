import { createSelector } from '@ngrx/store';
import { routerSelectors } from './router.selectors';
import { Ads } from '../reducers/ads.reducer';
import {
  AggregationStage,
  makeIntersection,
} from 'src/app/common/ds-select/sql/user-sql-functions/make-intersection';
import { State } from '../reducers';

function getCommonProps(items: Ads[]) {
  const acc = makeIntersection(items[0], null, AggregationStage.init);
  for (let i = 1; i < items.length; i++) {
    makeIntersection(items[i], acc, AggregationStage.step);
  }
  return makeIntersection(null, acc, AggregationStage.finalize);
}

const selectViewing = createSelector(
  routerSelectors.selectRouteParam('viewing'),
  (x: State) => x.ads.allAds,
  (param: string, ds: Ads[]) =>
    param && ds?.length ? param.split(',').map((x) => ds[+x]) : []
);
const selectReady = createSelector(
  routerSelectors.selectRouteParam('ready'),
  (x: State) => x.ads.allAds,
  (param: string, ds: Ads[]) =>
    param && ds?.length ? param.split(',').map((x) => ds[+x]) : []
);

const selectCommonViewingProps = createSelector(selectViewing, getCommonProps);
const selectCommonReadyProps = createSelector(selectReady, getCommonProps);

const selectSameTypeViewing = (index: number) =>
  createSelector(
    routerSelectors.selectRouteParam('viewing'),
    (x: State) => x.ads.selectedAds,
    (x: State) => x.ads.allAds,
    (viewing, selected, all) => {
      if (!viewing.length) return [];
      return viewing
        .split(',')
        .map((v) => selected.find((ds) => ds.index == +v) || all[+v])
        .filter((ds) => ds.identifier == all[index].identifier);
    }
  );

export const inspectorSelectors = {
  selectViewing,
  selectReady,
  selectCommonViewingProps,
  selectCommonReadyProps,
  selectSameTypeViewing,
};
