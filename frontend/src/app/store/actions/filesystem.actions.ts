import { createAction, props } from '@ngrx/store';
import { FolderInfo } from '../reducers/filesystem.reducer';

export const loadFilesystem = createAction('[root] load filesystem');
export const filesystemLoaded = createAction(
  '[fs API] filesystem loaded',
  props<{ fs: FolderInfo }>()
);
export const apiError = createAction('[fs API] error', props<{ error: any }>());
export const selectDatastore = createAction(
  '[filesystem] select datastore',
  props<{ path: string }>()
);
