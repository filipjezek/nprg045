from typing import  List, Tuple, TypedDict
from mozaik.storage.datastore import PickledDataStore, DataStore
from parameters import ParameterSet
import numpy as np
from .parameters import params

# these type definitons should correspond to those
# in /frontend/src/app/model-page/model.service.ts
#
# it should be space-efficient representation of the network data

class Positions(TypedDict):
  ids: np.ndarray
  x: np.ndarray
  y: np.ndarray

class Sheet(TypedDict):
  label: str
  neuronPositions: Positions

class Neuron(TypedDict):
  id: int
  
class Edge(TypedDict):
  srcIndex: int
  tgtIndex: int
  weight: float
  delay: float
  
class Connections(TypedDict):
  edges: List[Edge]
  src: str # sheet
  target: str # sheet
  
class JsonSerializableDataStore(TypedDict):
  sheets: List[Sheet]
  neurons: List[Neuron]
  connections: List[Connections]


def __get_datastore(path_to_datastore: str) -> JsonSerializableDataStore:
  """
  path_to_datastore: absolute path to mozaik datastore
  """
  datastore = PickledDataStore(
          load=True,
          parameters=ParameterSet(
            {'root_directory': path_to_datastore ,'store_stimuli' : False}),
          replace=False)
  sheets = __get_serializable_sheets(datastore)
  serializable: JsonSerializableDataStore = {
    'sheets': sheets,
    'neurons': __get_serializable_neurons(serializable['sheets']),
    'connections': __get_serializable_connections(datastore)
  }

  return serializable

def __get_serializable_sheets(datastore: DataStore) -> List[Sheet]:
  all_positions =  datastore.get_neuron_positions()
  sheets: List[Sheet] = [
    {
      'label': s,
      'neuronPositions': {
        'ids': datastore.get_sheet_ids(s, np.arange(0, len(all_positions[s][0]))),
        'x': all_positions[s][0],
        'y': all_positions[s][1]
      }
    } for s in all_positions
  ]
  return sheets

def __get_serializable_neurons(sheets: List[Sheet]) -> List[Neuron]:
  return list(
    map(
      lambda id: {'id': id},
      np.unique(np.concatenate([s['neuronPositions']['ids'] for s in sheets]))
    )
  )

class __MozaikConnection:
  source_name: str # sheet
  target_name: str # sheet
  weights: List[Tuple[int, int, float]] # (src index, tgt index, value)
  delays: List[Tuple[int, int, float]] # (src index, tgt index, value)
  

def __get_serializable_connections(datastore: DataStore) -> List[Connections]:
  connections: List[__MozaikConnection] = datastore.get_analysis_result(identifier='Connections')
  return [{
    'src': conn.source_name,
    'target': conn.target_name,
    'edges': [
      {
        'srcIndex': s,
        'tgtIndex': t,
        'weight': w,
        'delay': d
      } for (s,t,w), (_,_,d) in zip(conn.weights, conn.delays)
    ] 
  } for conn in connections]

# only one datastore should be accessed during the app lifetime so we will cache it
# (at least for now)
curr_datastore: JsonSerializableDataStore = __get_datastore(params['datastore_path'])