import { createAction, props } from '@ngrx/store';

export interface SortColumn {
  key: string;
  asc: boolean;
}
export interface ColumnFilter {
  /**
   * will add the condition to `where` or `having` based on if the key is an aggregator
   */
  key: string;
  /**
   * condition should already contain the key
   */
  condition: string;
}

export const sortByColumn = createAction(
  '[ds table header] sort by column',
  props<SortColumn>()
);
export const addCondition = createAction(
  '[ds table header] add condition',
  props<ColumnFilter>()
);
export const changeQuery = createAction(
  '[sql editor] change query',
  props<{ query: string }>()
);
