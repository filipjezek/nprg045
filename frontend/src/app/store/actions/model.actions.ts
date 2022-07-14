import { createAction, props } from '@ngrx/store';
import { ModelNetwork } from '../reducers/model.reducer';

export const loadModel = createAction(
  '[model page] load model',
  props<{ path: string }>()
);
export const modelLoaded = createAction(
  '[model API] model loaded',
  props<{ model: ModelNetwork }>()
);
export const apiError = createAction(
  '[model API] error',
  props<{ error: any }>()
);
