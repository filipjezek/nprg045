from pytest_mock import MockerFixture
from ..ads import AdsThumbnail, AdsIdentifier, get_ads_list, get_per_neuron_value
import pytest
import numpy as np
from . import mocks

@pytest.fixture
def datastore(mocker: MockerFixture):
    datastore = mocks.DataStoreMock(mocker)
    mocker.patch('backend.ads.load_datastore', return_value=datastore)
    return datastore

def test_get_ads_list(datastore: mocks.DataStoreMock):
    datastore.analysis_results = [
        mocks.DSAdsMock(analysis_algorithm="alg5", identifier=AdsIdentifier.PerNeuronValue.value, tags=['t1', 't2']),
        mocks.DSAdsMock(analysis_algorithm="alg3", identifier=AdsIdentifier.SingleValue.value, tags=['t1', 't2']),
        mocks.DSAdsMock(analysis_algorithm="alg1", identifier=AdsIdentifier.Connections.value),
        mocks.DSAdsMock(analysis_algorithm="alg5", identifier=AdsIdentifier.PerNeuronValue.value, tags=['t2', 't1']),
        mocks.DSAdsMock(analysis_algorithm="alg4", identifier=AdsIdentifier.PerNeuronValue.value, tags=['t2', 't1']),
        mocks.DSAdsMock(analysis_algorithm="alg2", identifier=AdsIdentifier.ConductanceSignalList.value),
        mocks.DSAdsMock(analysis_algorithm="alg6", identifier=AdsIdentifier.Connections.value),
        mocks.DSAdsMock(analysis_algorithm="alg7", identifier="foo", tags=['t1']),
    ]
    assert get_ads_list('path') == [
        AdsThumbnail(algorithm="alg2", identifier=AdsIdentifier.ConductanceSignalList.value, tags=[]),
        AdsThumbnail(algorithm="alg3", identifier=AdsIdentifier.SingleValue.value, tags=['t1', 't2']),
        AdsThumbnail(algorithm="alg4", identifier=AdsIdentifier.PerNeuronValue.value, tags=['t1', 't2']),
        AdsThumbnail(algorithm="alg5", identifier=AdsIdentifier.PerNeuronValue.value, tags=['t1', 't2']),
        AdsThumbnail(algorithm="alg7", identifier="foo", tags=['t1']),
    ], "should be sorted and duplicateless, also without connections"
    
def test_get_per_neuron_value(datastore: mocks.DataStoreMock):
    datastore.get_analysis_result.return_value = [
        mocks.DSPnvMock(
            identifier=AdsIdentifier.PerNeuronValue.value,
            neuron=12,
            sheet_name="sheet1",
            stimulus_id="stimulus1",
            ids=[1,2,3,4],
            period=0.31,
            value_units=None,
            value_name="value1",
            values=np.array([1,2,np.nan, np.nan, 1,2])
        ),
        mocks.DSPnvMock(
            identifier=AdsIdentifier.PerNeuronValue.value,
            neuron=13,
            sheet_name="sheet4",
            stimulus_id="stimulus4",
            ids=[1,2,3,4],
            period=None,
            value_units=mocks.QuantitiesMock(dimensionality=mocks.QuantitiesMock.Dimensionality(unicode="unit1")),
            value_name="value4",
            values=np.array([1,2,np.nan, np.nan, 0.7,2])
        ),
    ]
    
    assert get_per_neuron_value('path', 'testalg', ['testtag1', 'testtag2']) == [
        {
            'identifier': AdsIdentifier.PerNeuronValue.value,
            'algorithm': 'testalg',
            'tags': ['testtag1', 'testtag2'],
            'neuron': 12,
            'sheet': 'sheet1',
            'stimulus': 'stimulus1',
            'ids': [1,2,3,4],
            'period': 0.31,
            'unit': '',
            'valueName': 'value1',
            'values': [1,2,None,None,1,2]
        },
        {
            'identifier': AdsIdentifier.PerNeuronValue.value,
            'algorithm': 'testalg',
            'tags': ['testtag1', 'testtag2'],
            'neuron': 13,
            'sheet': 'sheet4',
            'stimulus': 'stimulus4',
            'ids': [1,2,3,4],
            'period': None,
            'unit': 'unit1',
            'valueName': 'value4',
            'values': [1,2,None,None,0.7,2]
        },
    ]
    