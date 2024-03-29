import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import * as fromUi from './ui.reducer';
import * as fromFs from './filesystem.reducer';
import * as fromAds from './ads.reducer';
import * as fromNet from './network.reducer';
import * as fromModel from './model.reducer';
import * as fromInspector from './inspector.reducer';
import * as fromNavigator from './navigator.reducer';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';

export const stateFeatureKey = 'state';

export interface State {
  [fromUi.uiFeatureKey]: fromUi.State;
  [fromFs.fsFeatureKey]: fromFs.State;
  [fromAds.adsFeatureKey]: fromAds.State;
  [fromNet.netFeatureKey]: fromNet.State;
  [fromModel.modelFeatureKey]: fromModel.State;
  [fromInspector.inspectorFeatureKey]: fromInspector.State;
  [fromNavigator.navigatorFeatureKey]: fromNavigator.State;
  router: RouterReducerState;
}

export const reducers: ActionReducerMap<State> = {
  [fromUi.uiFeatureKey]: fromUi.reducer,
  [fromFs.fsFeatureKey]: fromFs.reducer,
  [fromAds.adsFeatureKey]: fromAds.reducer,
  [fromNet.netFeatureKey]: fromNet.reducer,
  [fromModel.modelFeatureKey]: fromModel.reducer,
  [fromInspector.inspectorFeatureKey]: fromInspector.reducer,
  [fromNavigator.navigatorFeatureKey]: fromNavigator.reducer,
  router: routerReducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];
