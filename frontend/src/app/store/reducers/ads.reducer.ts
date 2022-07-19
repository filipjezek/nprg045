import { createReducer, on } from '@ngrx/store';
import { AdsLoaded, loadAds, specificAdsLoaded } from '../actions/ads.actions';

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

export interface AdsThumb {
  identifier: AdsIdentifier;
  algorithm: string;
  tags: string[];
}

export interface Ads extends AdsThumb {
  neuron: number;
  sheet: string;
  stimulus: string;
}

export interface PerNeuronValue extends Ads {
  values: number[];
  ids: number[];
  unit: string;
  value_name: string;
  period: number;
}

export interface State {
  allAds: AdsThumb[];
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
    selectedAds: ads,
  }))
);
