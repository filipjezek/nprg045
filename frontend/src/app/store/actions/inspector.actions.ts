import { createAction, props } from '@ngrx/store';
import { TabState } from '../reducers/inspector.reducer';

export const closeTab = createAction(
  '[ds inspector] close tab',
  props<{ index: number }>()
);
export const setTabState = createAction(
  '[ds page] set tab state',
  props<{ index: number; state: TabState }>()
);
export const toggleDsInfo = createAction(
  '[ds page] toggle ds info',
  props<{ collapsed: boolean }>()
);
