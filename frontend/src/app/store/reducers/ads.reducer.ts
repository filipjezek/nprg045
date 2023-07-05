import { createReducer, on } from '@ngrx/store';
import {
  AdsLoaded,
  adsLoadingProgress,
  clearSelectedAds,
  initAdsLoadingProgress,
  loadAds,
  removeFromSelectedAds,
  specificAdsLoaded,
} from '../actions/ads.actions';

export const adsFeatureKey = 'ads';

export enum AdsIdentifier {
  SingleValue = 'SingleValue',
  SingleValueList = 'SingleValueList',
  PerNeuronValue = 'PerNeuronValue',
  PerNeuronPairValue = 'PerNeuronPairValue',
  AnalogSignal = 'AnalogSignal',
  AnalogSignalList = 'AnalogSignalList',
  PerNeuronPairAnalogSignalList = 'PerNeuronPairAnalogSignalList',
  ConductanceSignalList = 'ConductanceSignalList',
  Connections = 'Connections',
}

export interface Ads {
  index: number;
  identifier: AdsIdentifier;
  algorithm: string;
  tags: string[];
  neuron: number;
  sheet: string;
  stimulus: Record<string, any>;
  unit: string;
  valueName: string;
  period: number;
}

export interface PerNeuronValue extends Ads {
  values: number[];
  ids: number[];
}

export interface PerNeuronPairValue extends Ads {
  values: number[][];
  ids: number[];
}

export interface AdsProgress {
  index: number;
  parts: Record<string, { curr: number; total: number }>;
}

export interface State {
  // ADS will not change until another datastore is loaded
  // therefore duplicated data between allAds and selectedAds
  // dont really matter
  allAds: Ads[];
  selectedAds: Ads[];
  loading: AdsProgress[];
}

export const initialState: State = {
  allAds: [],
  selectedAds: [],
  loading: [],
};

export const reducer = createReducer(
  initialState,
  on(loadAds, (state) => ({ ...state, allAds: [] })),
  on(AdsLoaded, (state, { ads }) => ({
    ...state,
    allAds: ads,
  })),
  on(specificAdsLoaded, (state, { ads }) => ({
    ...state,
    selectedAds: [...state.selectedAds, ads],
    loading: state.loading.filter((ds) => ds.index != ads.index),
  })),
  on(removeFromSelectedAds, (state, { index }) => ({
    ...state,
    selectedAds: state.selectedAds.filter((ds) => ds.index != index),
  })),
  on(clearSelectedAds, (state) => ({ ...state, selectedAds: [] })),
  on(initAdsLoadingProgress, (state, { index, parts }) => {
    const p2: AdsProgress['parts'] = {};
    for (const path in parts) {
      if (Object.prototype.hasOwnProperty.call(parts, path)) {
        p2[path] = { total: parts[path], curr: 0 };
      }
    }

    return {
      ...state,
      loading: [...state.loading, { index, parts: p2 }],
    };
  }),
  on(adsLoadingProgress, (state, { current, index, path }) => ({
    ...state,
    loading: state.loading.map((ds) =>
      ds.index == index
        ? {
            ...ds,
            parts: {
              ...ds.parts,
              [path]: { ...ds.parts[path], curr: current },
            },
          }
        : ds
    ),
  }))
);
