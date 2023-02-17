import { createReducer, on } from '@ngrx/store';
import {
  requestCancel,
  requestFinished,
  requestRetried,
  requestStarted,
} from '../actions/network.actions';

export const netFeatureKey = 'net';

export interface Request {
  id: number;
  url: string;
  method: string;
  start: number; // timestamp
  retries: number;
}

export interface State {
  requests: Request[];
}

export const initialState: State = {
  requests: [],
};

export const reducer = createReducer(
  initialState,
  on(requestStarted, (state, { id, url, method }) => ({
    ...state,
    requests: [
      ...state.requests,
      { id, url, method, start: Date.now(), retries: 0 },
    ],
  })),
  on(requestRetried, (state, { id }) => ({
    ...state,
    requests: state.requests.map((r) =>
      r.id == id ? { ...r, retries: r.retries + 1 } : r
    ),
  })),
  on(requestFinished, (state, { id }) => ({
    ...state,
    requests: state.requests.filter((r) => r.id != id),
  }))
);
