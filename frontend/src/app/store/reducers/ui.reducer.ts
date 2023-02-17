import { createReducer, on } from '@ngrx/store';
import {
  closeOverlay,
  loadingOverlayDecrement,
  loadingOverlayIncrement,
  openOverlay,
} from '../actions/ui.actions';

export const uiFeatureKey = 'ui';

export interface State {
  loadingOverlay: number;
  overlay: {
    zIndex: number;
    opacity: number;
    open: boolean;
  };
}

const defaultOverlay = {
  zIndex: 8,
  opacity: 0.6,
  open: false,
};

export const initialState: State = {
  loadingOverlay: 0,
  overlay: defaultOverlay,
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
  })),
  on(openOverlay, (state, { overlay }) => ({
    ...state,
    overlay: {
      ...defaultOverlay,
      ...overlay,
      open: true,
    },
  })),
  on(closeOverlay, (state) => ({
    ...state,
    overlay: { ...state.overlay, open: false },
  }))
);
