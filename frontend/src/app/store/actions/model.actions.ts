import { createAction, props } from '@ngrx/store';
import { Model, ModelInfo } from '../reducers/model.reducer';

export const loadModel = createAction(
  '[model page] load model',
  props<{ id: number }>()
);
export const modelLoaded = createAction(
  '[model API] model loaded',
  props<{ model: Model }>()
);
export const loadModelList = createAction(
  '[model page] load model list',
  props<{ take: number; skip: number }>()
);
export const modelListLoaded = createAction(
  '[model API] model list loaded',
  props<{ models: ModelInfo[]; totalResults: number }>()
);
export const apiError = createAction(
  '[model API] error',
  props<{ error: any }>()
);
