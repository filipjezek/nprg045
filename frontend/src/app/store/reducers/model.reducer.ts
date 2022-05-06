import { createReducer, on } from '@ngrx/store';
import { modelListLoaded, modelLoaded } from '../actions/model.actions';
import * as fromRoot from './index';

export const modelFeatureKey = 'model';

export interface ModelInfo {
  label: string;
  id: number;
}

export interface Model extends ModelInfo {
  layers: Layer[];
}

export interface Layer {
  label: string;
  nodes: Neuron[];
}

export interface Neuron {}

export interface ModelState {
  totalResults: number;
  availableModels: ModelInfo[];
  currentModel?: Model;
}

export interface State extends fromRoot.State {
  [modelFeatureKey]: ModelState;
}

export const initialState: ModelState = {
  totalResults: 1,
  availableModels: [],
  currentModel: null,
};

export const reducer = createReducer(
  initialState,
  on(modelListLoaded, (state, { models, totalResults }) => ({
    ...state,
    availableModels: [...models],
    totalResults,
  })),
  on(modelLoaded, (state, { model }) => ({
    ...state,
    currentModel: { ...model },
  }))
);
