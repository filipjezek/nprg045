import { createReducer, on } from '@ngrx/store';
import { closeTab, initTab, toggleDsInfo } from '../actions/inspector.actions';

export const inspectorFeatureKey = 'inspector';

export interface TabState {}

export interface State {
  /**
   * number is index of ads
   */
  tabs: Record<number, TabState>;
  dsInfoCollapsed: boolean;
}

export const initialState: State = {
  tabs: {},
  dsInfoCollapsed: true,
};

export const reducer = createReducer(
  initialState,
  on(initTab, (state, a) => ({
    ...state,
    tabs: {
      ...state.tabs,
      [a.index]: a.state,
    },
  })),
  on(closeTab, (state, { index }) => {
    const res = { ...state, tabs: { ...state.tabs } };
    delete res.tabs[index];
    return res;
  }),
  on(toggleDsInfo, (state, { collapsed }) => ({
    ...state,
    dsInfoCollapsed: collapsed,
  }))
);
