import pytest
from pytest_mock import MockerFixture
from . import mocks
from ..api.model.transforms import get_model, load_datastore
import numpy as np


@pytest.fixture
def datastore(mocker: MockerFixture):
    datastore = mocks.DataStoreMock(mocker)
    mocker.patch('backend.model.load_datastore', return_value=datastore)
    return datastore


def test_load_datastore(mocker: MockerFixture):
    patcher = mocker.patch('backend.model.PickledDataStore')
    load_datastore('path1')
    assert patcher.call_count == 1

    load_datastore('path1')
    assert patcher.call_count == 1, 'should cache'

    load_datastore('path2')
    assert patcher.call_count == 2

    load_datastore('path2')
    assert patcher.call_count == 2, 'should cache'
    load_datastore('path1')
    assert patcher.call_count == 2, 'should cache at least two calls'


def test_get_model(datastore: mocks.DataStoreMock):
    datastore.get_analysis_result.return_value = [
        mocks.MozaikConnectionMock(
            source_name="s1",
            target_name="s1",
            weights=[
                (0, 1, 0.9),
                (0, 2, 0.4),
                (1, 2, 0.2),
                (2, 0, 0.87),
            ],
            delays=[
                (0, 1, 0.1),
                (0, 2, 1.2),
                (1, 2, 1.4),
                (2, 0, 0.7),
            ],
        ),
        mocks.MozaikConnectionMock(
            source_name="s1",
            target_name="s2",
            weights=[
                (1, 0, 0.1),
                (0, 2, 0.2),
                (1, 2, 0.3),
                (0, 1, 0.4),
            ],
            delays=[
                (1, 0, 0.5),
                (0, 2, 0.6),
                (1, 2, 0.7),
                (0, 1, 0.8),
            ],
        )
    ]
    datastore.get_neuron_positions.return_value = {
        's1': np.array([[10, 8, 5], [9, 11, 4]]),
        's2': np.array([[-3, 7, 15], [19, 1, 2]]),
    }

    def get_sheet_ids_mock(sheet, indices):
        if (sheet == 's1'):
            return np.array([0, 1, 2])
        return np.array([3, 4, 5])
    datastore.get_sheet_ids.side_effect = get_sheet_ids_mock

    assert get_model('path') == {
        'sheets': [
            {'label': 's1', 'neuronPositions': {
                'ids': [0, 1, 2],
                'x': [10, 8, 5],
                'y': [9, 11, 4]
            }},
            {'label': 's2', 'neuronPositions': {
                'ids': [3, 4, 5],
                'x': [-3, 7, 15],
                'y': [19, 1, 2]
            }},
        ],
        'neurons': [
            {'id': 0},
            {'id': 1},
            {'id': 2},
            {'id': 3},
            {'id': 4},
            {'id': 5},
        ],
        'connections': [
            {
                'src': 's1',
                'target': 's1',
                'edges': [
                    {'srcIndex': 0, 'tgtIndex': 1, 'weight': 0.9, 'delay': 0.1},
                    {'srcIndex': 0, 'tgtIndex': 2, 'weight': 0.4, 'delay': 1.2},
                    {'srcIndex': 1, 'tgtIndex': 2, 'weight': 0.2, 'delay': 1.4},
                    {'srcIndex': 2, 'tgtIndex': 0, 'weight': 0.87, 'delay': 0.7},
                ]
            },
            {
                'src': 's1',
                'target': 's2',
                'edges': [
                    {'srcIndex': 1, 'tgtIndex': 0, 'weight': 0.1, 'delay': 0.5},
                    {'srcIndex': 0, 'tgtIndex': 2, 'weight': 0.2, 'delay': 0.6},
                    {'srcIndex': 1, 'tgtIndex': 2, 'weight': 0.3, 'delay': 0.7},
                    {'srcIndex': 0, 'tgtIndex': 1, 'weight': 0.4, 'delay': 0.8},
                ]
            }
        ]
    }
