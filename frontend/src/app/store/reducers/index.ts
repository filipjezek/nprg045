import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import * as fromUi from './ui.reducer';
import * as fromFs from './filesystem.reducer';

export const stateFeatureKey = 'state';

export interface State {
  [fromUi.uiFeatureKey]: fromUi.State;
  [fromFs.fsFeatureKey]: fromFs.State;
}

export const reducers: ActionReducerMap<State> = {
  [fromUi.uiFeatureKey]: fromUi.reducer,
  [fromFs.fsFeatureKey]: fromFs.reducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];
