from typing import List, Tuple, TypedDict, cast, Any, Iterator
from mozaik.storage.datastore import PickledDataStore, DataStore
from parameters import ParameterSet
import numpy as np
from functools import lru_cache
from ...parameters import params

# these type definitons should correspond to those
# in /frontend/src/app/services/model.service.ts
#
# it should be a space-efficient representation of the network data


class Sheet(TypedDict):
    label: str
    size: int


class Connections(TypedDict):
    src: str  # sheet
    target: str  # sheet
    size: int


class JsonSerializableModel(TypedDict):
    sheets: List[Sheet]
    connections: List[Connections]


# this function exists mostly for caching purposes
@lru_cache(1)
def load_datastore(path_to_datastore: str) -> PickledDataStore:
    return PickledDataStore(
        load=True,
        parameters=ParameterSet({
            'root_directory': path_to_datastore,
            'store_stimuli': False
        }),
        replace=False
    )


def get_model(path_to_datastore: str) -> JsonSerializableModel:
    """
    path_to_datastore: absolute path to mozaik datastore
    """
    datastore = load_datastore(path_to_datastore)
    sheets = __get_serializable_sheets(datastore)
    serializable: JsonSerializableModel = {
        'sheets': sheets,
        'connections': get_serializable_connections_meta(datastore)
    }

    return serializable


def __get_serializable_sheets(datastore: DataStore) -> List[Sheet]:
    all_positions = datastore.get_neuron_positions()
    sheets: List[Sheet] = [
        {
            'label': s,
            'size': len(all_positions[s][0])
        } for s in all_positions
    ]
    return sheets


def get_sheet_positions(path_to_datastore: str, sheet: str) -> Iterator[Tuple[int, int, int]]:
    """
    returns (id, x, y)
    """
    datastore = load_datastore(path_to_datastore)
    positions = datastore.get_neuron_positions()[sheet]
    for i in range(len(positions[0])):
        yield datastore.get_sheet_ids(sheet, [i])[0], positions[0][i], positions[1][i]


class __MozaikConnection:
    source_name: str  # sheet
    target_name: str  # sheet
    weights: List[Tuple[int, int, float]]  # (src index, tgt index, value)
    delays: List[Tuple[int, int, float]]  # (src index, tgt index, value)


def get_serializable_connections_meta(datastore: DataStore) -> List[Connections]:
    connections: List[__MozaikConnection] = cast(
        Any, datastore.get_analysis_result(identifier='Connections'))
    return [{
        'src': conn.source_name,
        'target': conn.target_name,
        'size': len(conn.delays)
    } for conn in connections]


def get_connections(path_to_datastore: str, src: str, tgt: str) -> Iterator[Tuple[int, int, float, float]]:
    """
    returns (srcIndex, tgtIndex, weight, delay)
    """
    datastore = load_datastore(path_to_datastore)
    connections: List[__MozaikConnection] = cast(
        Any, datastore.get_analysis_result(identifier='Connections'))
    for conn in connections:
        if conn.source_name == src and conn.target_name == tgt:
            for (s, t, w), (_, _, d) in zip(conn.weights, conn.delays):
                yield s, t, w, d
            break
