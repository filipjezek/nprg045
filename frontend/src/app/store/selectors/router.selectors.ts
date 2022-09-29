import { getSelectors } from '@ngrx/router-store';
import { createSelector } from '@ngrx/store';

export const routerSelectors = getSelectors();

export const selectUrlAfterDatastore = createSelector(
  routerSelectors.selectUrl,
  (url) => {
    if (!url.startsWith('/datastore/')) {
      return [];
    }
    const slash2 = url.indexOf('/', '/datastore/'.length) + 1;
    if (slash2 === 0) return [];
    return url.slice(slash2).split('/');
  }
);
