import { createReducer, on } from '@ngrx/store';
import { modelLoaded } from '../actions/model.actions';
import * as fromRoot from './index';

export const modelFeatureKey = 'model';

// one large network containing all nodes and connections.
// connections and nodes can be viewed differently based on sheet parameter
export interface ModelNetwork {
  nodes: NetworkNode[];
}

export interface NetworkNode {
  id: number; // this is for convenience
  sheets: {
    [key: string]: {
      x: number;
      y: number;
      connections: {
        sheet: string;
        node: NetworkNode;
        weight: number;
        delay: number;
      }[];
    };
  };
}

export interface ModelState {
  currentModel?: ModelNetwork;
}

export interface State extends fromRoot.State {
  [modelFeatureKey]: ModelState;
}

export const initialState: ModelState = {
  currentModel: null,
};

export const reducer = createReducer(
  initialState,
  on(modelLoaded, (state, { model }) => ({
    ...state,
    currentModel: { ...model },
  }))
);