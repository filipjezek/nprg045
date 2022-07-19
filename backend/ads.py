from enum import Enum
from typing import List, TypedDict
import json
from .model import load_datastore

class AdsIdentifier(Enum):
    SingleValue = 'SingleValue'
    SingleValueList = 'SingleValueList'
    PerNeuronValue = 'PerNeuronValue'
    PerNeuronPairValue = 'PerNeuronPairValue'
    AnalogSignal = 'AnalogSignal'
    AnalogSignalList = 'AnalogSignalList'
    PerNeuronPairAnalogSignalList = 'PerNeuronPairAnalogSignalList'
    ConductanceSignalList = 'ConductanceSignalList'
    Connections = 'Connections'

class __AdsThumbnail(TypedDict):
    identifier: str
    algorithm: str
    tags: List[str]

class __Ads(__AdsThumbnail):
    neuron: int
    sheet: str
    stimulus: str
    
class __SerializablePerNeuronValue(__Ads):
    values: List[float]
    unit: str
    ids: List[int]
    valueName: str
    period: float

def get_ads_list(path_to_datastore: str) -> List[__AdsThumbnail]:
    datastore = load_datastore(path_to_datastore)
    duplicateless = set(
        json.dumps({
            'algorithm': ads.analysis_algorithm,
            'identifier': ads.identifier,
            'tags': list(sorted(ads.tags))
        }) for ads in datastore.analysis_results
        if ads.identifier != AdsIdentifier.Connections.value
    )
    return [json.loads(s) for s in duplicateless]

def get_per_neuron_value(path_to_datastore: str, alg: str, tags: List[str], **kwargs) -> List[__SerializablePerNeuronValue]:
    datastore = load_datastore(path_to_datastore)
    ads = datastore.get_analysis_result(
        identifier=AdsIdentifier.PerNeuronValue.value,
        analysis_algorithm=alg,
        **kwargs
    )
    return [{
        'identifier': AdsIdentifier.PerNeuronValue.value,
        'algorithm': alg,
        'tags': tags,
        'neuron': a.neuron,
        'sheet': a.sheet_name,
        'stimulus': a.stimulus_id,
        'ids': a.ids,
        'period': a.period,
        'unit': str(a.value_units),
        'valueName': a.value_name,
        'values': a.values.tolist()
    } for a in ads]
    