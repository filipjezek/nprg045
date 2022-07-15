import { createReducer, on } from '@ngrx/store';
import { filesystemLoaded } from '../actions/filesystem.actions';

export const fsFeatureKey = 'fs';

export interface FolderInfo {
  name: string;
  datastore: boolean;
  content: FolderInfo[];
}

export interface State {
  datastores: FolderInfo;
}

export const initialState: State = {
  datastores: null,
};

export const reducer = createReducer(
  initialState,
  on(filesystemLoaded, (state, { fs }) => ({ ...state, datastores: fs }))
);
