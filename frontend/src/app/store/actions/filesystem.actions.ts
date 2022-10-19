import { createAction, props } from '@ngrx/store';
import { FolderInfo } from '../reducers/filesystem.reducer';

export const loadRecursiveFilesystem = createAction(
  '[root] load recursive filesystem',
  props<{ path?: string }>()
);
export const loadDirectory = createAction(
  '[root] load directory',
  props<{ path?: string }>()
);
export const toggleDirectory = createAction(
  '[sidebar] toggle directory',
  props<{ open: boolean; path: string }>()
);
export const filesystemLoaded = createAction(
  '[fs API] filesystem loaded',
  props<{ fs: FolderInfo; path?: string }>()
);
export const apiError = createAction('[fs API] error', props<{ error: any }>());
