import { createReducer, on } from '@ngrx/store';
import {
  filesystemLoaded,
  toggleDirectory,
} from '../actions/filesystem.actions';

export const fsFeatureKey = 'fs';

export interface FolderInfo {
  name: string;
  datastore: boolean;
  content: (FolderInfo | string)[];
  open?: boolean;
}

export interface State {
  datastores: FolderInfo;
}

export const initialState: State = {
  datastores: null,
};

export const reducer = createReducer(
  initialState,
  on(filesystemLoaded, (state, { fs, path }) => {
    if (!path) return { ...state, datastores: { ...fs, open: true } };
    return {
      ...state,
      datastores: replaceFolder(state.datastores, path.slice(1), (folder) =>
        mergeFolder(folder, fs)
      ),
    };
  }),
  on(toggleDirectory, (state, { open, path }) => ({
    ...state,
    datastores: replaceFolder(state.datastores, path.slice(1), (f) =>
      typeof f == 'string' ? (f as any) : { ...f, open }
    ),
  }))
);

function replaceFolder(
  fs: FolderInfo,
  path: string,
  replacer: (curr: FolderInfo | string) => FolderInfo
): FolderInfo {
  if (path == '') {
    return replacer(fs);
  }
  const res = {
    ...fs,
    content: fs.content.map((f) => {
      if (typeof f == 'string' && path == f) {
        return { ...replacer(f), name: f };
      }
      if (typeof f != 'string' && path.startsWith(f.name)) {
        return replaceFolder(f, path.slice(f.name.length + 1), replacer);
      }
      return f;
    }),
  };
  return res;
}

function mergeFolder(
  old: FolderInfo | string,
  replacement: FolderInfo
): FolderInfo {
  if (typeof old == 'string') {
    return { ...replacement, name: old, open: true };
  }

  const oldContent = new Map<string, FolderInfo>();
  old.content.forEach((x) => {
    if (typeof x != 'string') {
      oldContent.set(x.name, x);
    }
  });

  return {
    ...replacement,
    name: old.name,
    content: replacement.content.map((x) => {
      if (typeof x == 'string' && oldContent.has(x)) {
        return oldContent.get(x);
      }
      return x;
    }),
  };
}
