import { createReducer, on } from '@ngrx/store';
import {
  filesystemLoaded,
  selectDatastore,
} from '../actions/filesystem.actions';
import * as fromRoot from './index';

export const fsFeatureKey = 'fs';

export interface FolderInfo {
  name: string;
  datastore: boolean;
  content: FolderInfo[];
}

export interface State {
  datastores: FolderInfo;
  selectedDatastore: string;
}

export const initialState: State = {
  datastores: null,
  selectedDatastore: null,
};

export const reducer = createReducer(
  initialState,
  on(filesystemLoaded, (state, { fs }) => ({ ...state, datastores: fs })),
  on(selectDatastore, (state, { path }) => ({
    ...state,
    selectedDatastore: path,
  }))
);
