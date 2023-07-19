import { createSelector } from '@ngrx/store';
import { State } from '../reducers';
import { SQLBuilder } from 'src/app/common/ds-select/sql/sql-builder';

const selectOrderColumn = createSelector(
  (x: State) => x.navigator.query,
  (query) => new SQLBuilder(query, null).extractSortColumn()
);

export const navigatorSelectors = {
  selectOrderColumn,
};
