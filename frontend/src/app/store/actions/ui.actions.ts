import { createAction, props } from '@ngrx/store';

export const loadingOverlayIncrement = createAction(
  '[Loading Overlay] increment'
);
export const loadingOverlayDecrement = createAction(
  '[Loading Overlay] decrement'
);
export const openOverlay = createAction(
  '[Overlay] open',
  props<{ overlay: { zIndex?: number; opacity?: number } }>()
);
export const closeOverlay = createAction('[Overlay] close');
