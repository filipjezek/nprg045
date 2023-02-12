from enum import Enum
from typing import List, TypedDict, cast, Any
import json
from .model import load_datastore
import numpy as np
import math
import quantities


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


class AdsThumbnail(TypedDict):
    identifier: str
    algorithm: str
    tags: List[str]


class Ads(AdsThumbnail):
    neuron: int
    sheet: str
    stimulus: str


class SerializablePerNeuronValue(Ads):
    values: List[float]
    unit: str
    ids: List[int]
    valueName: str
    period: float


def get_ads_list(path_to_datastore: str) -> List[AdsThumbnail]:
    datastore = load_datastore(path_to_datastore)
    duplicateless = set(
        json.dumps({
            'algorithm': ads.analysis_algorithm,
            'identifier': ads.identifier,
            'tags': list(sorted(ads.tags))
        }) for ads in datastore.analysis_results
        if ads.identifier != AdsIdentifier.Connections.value
    )
    return [json.loads(s) for s in sorted(duplicateless)]


def get_per_neuron_value(path_to_datastore: str, alg: str, tags: List[str], **kwargs) -> List[SerializablePerNeuronValue]:
    datastore = load_datastore(path_to_datastore)
    ads = cast(Any, datastore.get_analysis_result(
        identifier=AdsIdentifier.PerNeuronValue.value,
        analysis_algorithm=alg,
        **kwargs
    ))

    return [cast(SerializablePerNeuronValue, {
        'identifier': AdsIdentifier.PerNeuronValue.value,
        'algorithm': alg,
        'tags': tags,
        'neuron': int(a.neuron) if a.neuron else None,
        'sheet': a.sheet_name,
        'stimulus': a.stimulus_id,
        'ids': [int(id) for id in a.ids],
        'period': float(a.period) if a.period else None,
        'unit': '' if a.value_units is None or a.value_units is quantities.unitquantity.Dimensionless else a.value_units.dimensionality.unicode,
        'valueName': a.value_name,
        'values': [None if math.isnan(i) else i for i in a.values.tolist()]
    }) for a in ads]
