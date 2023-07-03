import { createReducer, on } from '@ngrx/store';
import {
  AdsLoaded,
  clearSelectedAds,
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

export interface State {
  // ADS will not change until another datastore is loaded
  // therefore duplicated data between allAds and selectedAds
  // dont really matter
  allAds: Ads[];
  selectedAds: Ads[];
}

export const initialState: State = {
  allAds: [],
  selectedAds: [],
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
  })),
  on(removeFromSelectedAds, (state, { index }) => ({
    ...state,
    selectedAds: state.selectedAds.filter((ds) => ds.index != index),
  })),
  on(clearSelectedAds, (state) => ({ ...state, selectedAds: [] }))
);
