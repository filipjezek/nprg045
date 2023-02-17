import { createAction, props } from '@ngrx/store';

export const requestStarted = createAction(
  '[Network] request started',
  props<{ id: number; url: string; method: string }>()
);

export const requestRetried = createAction(
  '[Network] request retried',
  props<{ id: number }>()
);

export const requestCancel = createAction(
  '[Network] request cancel',
  props<{ id: number }>()
);

export const requestFinished = createAction(
  '[Network] request finished',
  props<{ id: number }>()
);
