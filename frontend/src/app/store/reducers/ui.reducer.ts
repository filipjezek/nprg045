import { createReducer, on } from '@ngrx/store';
import {
  loadingOverlayDecrement,
  loadingOverlayIncrement,
} from '../actions/ui.actions';

export const uiFeatureKey = 'ui';

export interface State {
  loadingOverlay: number;
}

export const initialState: State = {
  loadingOverlay: 0,
};

export const reducer = createReducer(
  initialState,
  on(loadingOverlayIncrement, (state) => ({
    ...state,
    loadingOverlay: state.loadingOverlay + 1,
  })),
  on(loadingOverlayDecrement, (state) => ({
    ...state,
    loadingOverlay: state.loadingOverlay - 1,
  }))
);
