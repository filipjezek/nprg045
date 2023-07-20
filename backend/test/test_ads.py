from pytest_mock import MockerFixture
from ..api.ads.transforms import Ads, AdsIdentifier, get_ads_list, get_per_neuron_value, get_per_neuron_pair_value, \
    get_analog_signal_list, iter_pnpv_values, iter_asl_values, flask
import pytest
import numpy as np
from . import mocks


@pytest.fixture
def datastore(mocker: MockerFixture):
    datastore = mocks.DataStoreMock(mocker)
    mocker.patch('backend.api.ads.transforms.load_datastore',
                 return_value=datastore)
    return datastore


@pytest.fixture
def flask_request(mocker: MockerFixture):
    req = mocks.FlaskRequestMock(mocker)
    mocker.patch.object(flask, 'request', req)
    req.args = mocks.FlaskRequestArgsMock(mocker)
    req.args.to_dict.return_value = {'cat': 'dog'}


def test_get_ads_list(datastore: mocks.DataStoreMock):
    datastore.analysis_results = [
        mocks.DSAdsMock(analysis_algorithm="alg5", sheet_name="sheet1", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.PerNeuronValue.value, tags=['t1', 't2']),
        mocks.DSAdsMock(analysis_algorithm="alg3", sheet_name="sheet1", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.SingleValue.value, tags=['t1', 't2']),
        mocks.DSAdsMock(analysis_algorithm="alg1", sheet_name="sheet2", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.Connections.value),
        mocks.DSAdsMock(analysis_algorithm="alg5", sheet_name="sheet3", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.PerNeuronValue.value, tags=['t2', 't1']),
        mocks.DSAdsMock(analysis_algorithm="alg4", sheet_name="sheet3", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.PerNeuronValue.value, tags=['t2', 't1']),
        mocks.DSAdsMock(analysis_algorithm="alg2", sheet_name=None, stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.ConductanceSignalList.value),
        mocks.DSAdsMock(analysis_algorithm="alg6", sheet_name="sheet1", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.Connections.value)
    ]
    assert get_ads_list('path') == [
        Ads(identifier=AdsIdentifier.ConductanceSignalList.value, algorithm="alg2",
            sheet=None, stimulus={'foo': 'bar'}, neuron=None,
            period=None, unit='', valueName=None, tags=[]),

        Ads(identifier=AdsIdentifier.PerNeuronValue.value, algorithm="alg4",
            sheet="sheet3", stimulus={'foo': 'bar'}, neuron=None,
            period=None, unit='', valueName=None, tags=['t1', 't2']),

        Ads(identifier=AdsIdentifier.PerNeuronValue.value, algorithm="alg5",
            sheet="sheet1", stimulus={'foo': 'bar'},
            neuron=None, period=None, unit='', valueName=None, tags=['t1', 't2']),

        Ads(identifier=AdsIdentifier.PerNeuronValue.value, algorithm="alg5",
            sheet="sheet3", stimulus={'foo': 'bar'},
            neuron=None, period=None, unit='', valueName=None, tags=['t1', 't2']),

        Ads(identifier=AdsIdentifier.SingleValue.value, algorithm="alg3",
            neuron=None, period=None, unit='', valueName=None,
            tags=['t1', 't2'], sheet="sheet1", stimulus={'foo': 'bar'}),
    ], "should be sorted and without connections"


def test_get_ads_list_with_connections(datastore: mocks.DataStoreMock):
    datastore.analysis_results = [
        mocks.DSAdsMock(analysis_algorithm="alg5", sheet_name="sheet1", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.PerNeuronValue.value, tags=['t1', 't2']),
        mocks.DSAdsMock(analysis_algorithm="alg3", sheet_name="sheet1", stimulus_id="{'foo': 'bar'}",
                        identifier=AdsIdentifier.SingleValue.value, tags=['t1', 't2']),
    ]
    datastore.get_neuron_positions.return_value = {
        'a': None, 'c': None, 'b': None
    }

    assert get_ads_list('path') == [
        Ads(identifier=AdsIdentifier.PerNeuronValue.value, algorithm="alg5",
            sheet="sheet1", stimulus={'foo': 'bar'},
            neuron=None, period=None, unit='', valueName=None, tags=['t1', 't2']),

        Ads(identifier=AdsIdentifier.SingleValue.value, algorithm="alg3",
            neuron=None, period=None, unit='', valueName=None,
            tags=['t1', 't2'], sheet="sheet1", stimulus={'foo': 'bar'}),

        Ads(identifier=AdsIdentifier.Connections.value, algorithm="connection storage",
            neuron=None, period=None, unit=None, valueName=None,
            tags=None, sheet="a", stimulus=None),

        Ads(identifier=AdsIdentifier.Connections.value, algorithm="connection storage",
            neuron=None, period=None, unit=None, valueName=None,
            tags=None, sheet="b", stimulus=None),

        Ads(identifier=AdsIdentifier.Connections.value, algorithm="connection storage",
            neuron=None, period=None, unit=None, valueName=None,
            tags=None, sheet="c", stimulus=None),
    ]


def test_get_per_neuron_value(datastore: mocks.DataStoreMock):
    unit = mocks.QuantitiesMock(
        dimensionality=mocks.QuantitiesMock.Dimensionality(unicode="unit1"))
    datastore.get_analysis_result.return_value = [
        mocks.DSPnvMock(
            analysis_algorithm="testalg",
            identifier=AdsIdentifier.PerNeuronValue.value,
            neuron=12,
            sheet_name="sheet1",
            stimulus_id="{'foo': 'bar'}",
            ids=[1, 2, 3, 4],
            period=0.31,
            value_units=None,
            value_name="value1",
            values=np.array([1, 2, np.nan, np.nan, 1, 2]),
            tags=['testtag1', 'testtag2']
        ),
        mocks.DSPnvMock(
            analysis_algorithm="testalg",
            identifier=AdsIdentifier.PerNeuronValue.value,
            neuron=13,
            sheet_name="sheet4",
            stimulus_id="{'foo': 'bar'}",
            ids=[1, 2, 3, 4],
            period=None,
            value_units=unit,
            value_name="value4",
            values=np.array([1, 2, np.nan, np.nan, 0.7, 2]),
            tags=['testtag1', 'testtag2']
        ),
    ]

    assert get_per_neuron_value('path', 'testalg', tags=['testtag1', 'testtag2']) == [
        {
            'identifier': AdsIdentifier.PerNeuronValue.value,
            'algorithm': 'testalg',
            'tags': ['testtag1', 'testtag2'],
            'neuron': 12,
            'sheet': 'sheet1',
            'stimulus': {'foo': 'bar'},
            'ids': [1, 2, 3, 4],
            'period': 0.31,
            'unit': '',
            'valueName': 'value1',
            'values': [1.0, 2.0, None, None, 1.0, 2.0]
        },
        {
            'identifier': AdsIdentifier.PerNeuronValue.value,
            'algorithm': 'testalg',
            'tags': ['testtag1', 'testtag2'],
            'neuron': 13,
            'sheet': 'sheet4',
            'stimulus': {'foo': 'bar'},
            'ids': [1, 2, 3, 4],
            'period': None,
            'unit': unit,
            'valueName': 'value4',
            'values': [1.0, 2.0, None, None, 0.7, 2.0]
        },
    ]


@pytest.fixture
def datastore_with_pnpv(datastore: mocks.DataStoreMock, flask_request):
    datastore.get_analysis_result.return_value = [
        mocks.DSPnpvMock(
            analysis_algorithm="testalg",
            identifier=AdsIdentifier.PerNeuronPairValue.value,
            neuron=12,
            sheet_name="sheet1",
            stimulus_id="{'foo': 'bar'}",
            ids=[1, 2, 3, 4],
            period=0.31,
            value_units=None,
            value_name="value1",
            values=np.arange(16).reshape(4, 4),
            tags=['testtag1', 'testtag2']
        )
    ]
    return datastore


def test_get_per_neuron_pair_value(datastore_with_pnpv: mocks.DataStoreMock):
    assert get_per_neuron_pair_value('path', 'testalg', tags=['testtag1', 'testtag2']) == [
        {
            'identifier': AdsIdentifier.PerNeuronPairValue.value,
            'algorithm': 'testalg',
            'tags': ['testtag1', 'testtag2'],
            'neuron': 12,
            'sheet': 'sheet1',
            'stimulus': {'foo': 'bar'},
            'ids': [1, 2, 3, 4],
            'period': 0.31,
            'unit': '',
            'valueName': 'value1',
            'values': {'@link': 'analysis_ds/pnpv?cat=dog', 'dimensions': [4, 4]}
        }
    ]


def test_iter_pnpv_values(datastore_with_pnpv: mocks.DataStoreMock):
    vals = [
        list(row) for row in
        iter_pnpv_values('path', 'testalg', {'foo': 'bar'}, tags=[
                         'testtag1', 'testtag2'])
    ]
    assert vals == [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15]
    ]


@pytest.fixture
def datastore_with_asl(datastore: mocks.DataStoreMock, flask_request):
    datastore.get_analysis_result.return_value = [
        mocks.DSAslMock(
            analysis_algorithm="testalg",
            identifier=AdsIdentifier.PerNeuronPairValue.value,
            neuron=12,
            sheet_name="sheet1",
            stimulus_id="{'foo': 'bar'}",
            ids=[1, 2, 3, 4],
            period=0.31,
            value_units=None,
            value_name="value1",
            asl=[mocks.AslMock(
                flat=list(range(8)),
                t_start=mocks.QuantitiesMock(
                    magnitude=0.0, dimensionality=mocks.QuantitiesMock.Dimensionality(unicode="s")),
                sampling_period=mocks.QuantitiesMock(
                    magnitude=1.0, dimensionality=mocks.QuantitiesMock.Dimensionality(unicode="s")),
                shape=(4, 2),
            )] * 3,
            tags=['testtag1', 'testtag2']
        )
    ]
    return datastore


def test_get_analog_signal_list(datastore_with_asl: mocks.DataStoreMock):
    assert get_analog_signal_list('path', 'testalg', tags=['testtag1', 'testtag2']) == [
        {
            'identifier': AdsIdentifier.PerNeuronPairValue.value,
            'algorithm': 'testalg',
            'tags': ['testtag1', 'testtag2'],
            'neuron': 12,
            'sheet': 'sheet1',
            'stimulus': {'foo': 'bar'},
            'ids': [1, 2, 3, 4],
            'period': 0.31,
            'unit': '',
            'timeUnit': get_analog_signal_list('path', 'testalg', tags=['testtag1', 'testtag2'])[0]['timeUnit'],
            'startTime': 0.0,
            'samplingPeriod': 1.0,
            'valueName': 'value1',
            'values': {'@link': 'analysis_ds/asl?cat=dog', 'dimensions': [3, 4]}
        }
    ]


def test_iter_asl_values(datastore_with_asl: mocks.DataStoreMock):
    vals = list(
        iter_asl_values('path', 'testalg', {'foo': 'bar'}, tags=[
            'testtag1', 'testtag2'])
    )
    assert vals == [tuple(range(8))] * 3
