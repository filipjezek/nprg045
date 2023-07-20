import pytest
from pytest_mock import MockerFixture
from . import mocks
from ..api.model.transforms import get_model, load_datastore, get_sheet_positions, get_connections
import numpy as np


@pytest.fixture
def datastore(mocker: MockerFixture):
    datastore = mocks.DataStoreMock(mocker)
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
            return np.array([[0, 1, 2][i] for i in indices])
        return np.array([[3, 4, 5][i] for i in indices])
    datastore.get_sheet_ids.side_effect = get_sheet_ids_mock
    mocker.patch('backend.api.model.transforms.load_datastore',
                 return_value=datastore)
    return datastore


def test_load_datastore(mocker: MockerFixture):
    patcher = mocker.patch('backend.api.model.transforms.PickledDataStore')
    load_datastore('path1')
    assert patcher.call_count == 1

    load_datastore('path1')
    assert patcher.call_count == 1, 'should cache'

    load_datastore('path2')
    assert patcher.call_count == 2

    load_datastore('path2')
    assert patcher.call_count == 2, 'should cache'
    load_datastore('path1')
    assert patcher.call_count == 3, 'should cache exactly one call'


def test_get_model(datastore: mocks.DataStoreMock):
    assert get_model('path') == {
        'sheets': [
            {'label': 's1', 'size': 3},
            {'label': 's2', 'size': 3}
        ],
        'connections': [
            {'src': 's1', 'target': 's1', 'size': 4},
            {'src': 's1', 'target': 's2', 'size': 4},
        ]
    }


def test_iterate_sheet_positions(datastore: mocks.DataStoreMock):
    assert list(get_sheet_positions('path', 's1')) == [
        (0, 10, 9),
        (1, 8, 11),
        (2, 5, 4)
    ]
    assert list(get_sheet_positions('path', 's2')) == [
        (3, -3, 19),
        (4, 7, 1),
        (5, 15, 2)
    ]


def test_iterate_connections(datastore: mocks.DataStoreMock):
    assert list(get_connections('path', 's1', 's1')) == [
        (0, 1, 0.9, 0.1),
        (0, 2, 0.4, 1.2),
        (1, 2, 0.2, 1.4),
        (2, 0, 0.87, 0.7),
    ]
    assert list(get_connections('path', 's1', 's2')) == [
        (1, 0, 0.1, 0.5),
        (0, 2, 0.2, 0.6),
        (1, 2, 0.3, 0.7),
        (0, 1, 0.4, 0.8)
    ]
