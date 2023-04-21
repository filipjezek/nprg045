import { createReducer, on } from '@ngrx/store';
import {
  closeTab,
  setTabState,
  toggleDsInfo,
} from '../actions/inspector.actions';
import {
  addCondition,
  changeQuery,
  sortByColumn,
} from '../actions/navigator.actions';
import { SQLBuilder } from 'src/app/common/ds-select/sql/sql-builder';

export const navigatorFeatureKey = 'navigator';

export interface State {
  query: string;
}

export const initialState: State = {
  query: `SELECT
  MAKE_LINK(\`index\`) link,
  \`index\`,
  algorithm,
  identifier,
  MAKE_DIFF(stimulus, stimulus->name) \`stimulus diff\`,
  stimulus,
  sheet,
  neuron,
  valueName,
  tags
FROM
  data`,
};

export const reducer = createReducer(
  initialState,
  on(changeQuery, (state, { query }) => ({ ...state, query })),
  on(sortByColumn, (state, col) => ({
    ...state,
    query: new SQLBuilder(state.query).orderBy(col).toFormattedString(),
  })),
  on(addCondition, (state, { key, condition }) => {
    const builder = new SQLBuilder(state.query);
    if (builder.getAggregatedCols().includes(key)) {
      builder.andHaving(condition);
    } else {
      builder.andWhere(condition);
    }
    return { ...state, query: builder.toFormattedString() };
  })
);
