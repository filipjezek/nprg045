import { createAction } from '@ngrx/store';

export const loadingOverlayIncrement = createAction(
  '[Loading Overlay] increment'
);
export const loadingOverlayDecrement = createAction(
  '[Loading Overlay] decrement'
);
