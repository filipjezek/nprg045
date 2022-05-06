import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import * as fromUi from './ui.reducer';

export const stateFeatureKey = 'state';

export interface State {  [fromUi.uiFeatureKey]: fromUi.State;
}

export const reducers: ActionReducerMap<State> = {  [fromUi.uiFeatureKey]: fromUi.reducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
