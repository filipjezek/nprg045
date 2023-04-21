import { createSelector } from '@ngrx/store';
import { State } from '../reducers';
import { SQLBuilder } from 'src/app/common/ds-select/sql/sql-builder';

export const selectOrderColumn = createSelector(
  (x: State) => x.navigator.query,
  (query) => new SQLBuilder(query).extractSortColumn()
);
