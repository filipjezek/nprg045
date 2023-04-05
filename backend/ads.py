from enum import Enum
from typing import List, TypedDict, cast, Any, Dict
from .model import load_datastore
import math
import quantities
import ast


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


class Ads(TypedDict):
    identifier: str
    algorithm: str
    tags: List[str]
    sheet: str
    stimulus: Dict
    valueName: str
    period: float
    neuron: int
    unit: str


class SerializablePerNeuronValue(Ads):
    values: List[float]
    ids: List[int]


def get_ads_list(path_to_datastore: str) -> List[Ads]:
    order = ['identifier', 'algorithm', 'stimulus',
             'valueName', 'sheet', 'neuron']
    datastore = load_datastore(path_to_datastore)
    return list(sorted(
        (__get_ads_base(ads) for ads in datastore.analysis_results),
        key=lambda d: tuple(str(d[key]) if key ==
                            'stimulus' else d[key] or '' for key in order)
    ))


def get_per_neuron_value(path_to_datastore: str, alg: str, **kwargs) -> List[SerializablePerNeuronValue]:
    datastore = load_datastore(path_to_datastore)
    ads = cast(Any, datastore.get_analysis_result(
        identifier=AdsIdentifier.PerNeuronValue.value,
        analysis_algorithm=alg,
        **kwargs
    ))

    return [cast(SerializablePerNeuronValue, {
        'ids': [int(id) for id in a.ids],
        'values': [None if math.isnan(i) else i for i in a.values.tolist()],
        **__get_ads_base(a)
    }) for a in ads]


def __get_ads_base(ads: Any) -> Ads:
    return cast(Ads, {
        'algorithm': ads.analysis_algorithm,
        'identifier': ads.identifier,
        'tags': list(sorted(ads.tags)),
        'neuron': int(ads.neuron) if ads.neuron else None,
        'sheet': ads.sheet_name,
        'stimulus': ads.stimulus_id and ast.literal_eval(ads.stimulus_id),
        'period': float(ads.period) if ads.period else None,
        'unit': '' if ads.value_units is None or ads.value_units is quantities.unitquantity.Dimensionless else ads.value_units.dimensionality.unicode,
        'valueName': ads.value_name,
    })
