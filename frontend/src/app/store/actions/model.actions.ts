import { createAction, props } from '@ngrx/store';
import { ModelNetwork, NetworkMetadata } from '../reducers/model.reducer';

export const loadModel = createAction(
  '[model page] load model',
  props<{ path: string }>()
);
export const metadataLoaded = createAction(
  '[model API] metadata loaded',
  props<{ meta: NetworkMetadata }>()
);
export const connectionsLoadingProgress = createAction(
  '[model API] connections loading progress',
  props<{ current: number; src: string; tgt: string }>()
);
export const positionsLoadingProgress = createAction(
  '[model API] positions loading progress',
  props<{ sheet: string; current: number }>()
);
export const modelLoaded = createAction(
  '[model API] model loaded',
  props<{ model: ModelNetwork }>()
);
export const apiError = createAction(
  '[model API] error',
  props<{ error: any }>()
);
