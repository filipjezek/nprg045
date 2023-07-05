from enum import Enum
from typing import List, TypedDict, cast, Any, Dict
from .model import load_datastore, get_serializable_connections_meta
import math
from urllib.parse import urlencode
import ast
import flask


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


class AdsLink(TypedDict('AdsLink', {'@link': str})):
    dimensions: List[int]


class SerializablePerNeuronValue(Ads):
    values: List[float]
    ids: List[int]


class SerializablePerNeuronPairValue(Ads):
    values: AdsLink
    ids: List[int]


class SerializableASL(Ads):
    values: List[float]
    ids: List[int]


def get_ads_list(path_to_datastore: str) -> List[Ads]:
    order = ['identifier', 'algorithm', 'stimulus',
             'valueName', 'sheet', 'neuron']
    datastore = load_datastore(path_to_datastore)
    ads_list = list(sorted(
        (__get_ads_base(ads) for ads in datastore.analysis_results
         if ads.identifier != AdsIdentifier.Connections.value),
        key=lambda d: tuple(
            str(d[key]) if key == 'stimulus' else d[key]
            if d[key] else ''
            for key in order
        )
    ))

    conn_meta = get_serializable_connections_meta(datastore)
    ads_list.extend(sorted(
        (cast(Ads, {
            'algorithm': 'connection storage',
            'identifier': AdsIdentifier.Connections.value,
            'tags': None,
            'neuron': None,
            'sheet': conn['src'],
            'stimulus': None,
            'period': None,
            'unit': None,
            'valueName': None
        }) for conn in conn_meta if conn['src'] == conn['target']),
        key=lambda d: tuple(d['sheet'])
    ))

    return ads_list


def get_per_neuron_value(path_to_datastore: str, alg: str, **kwargs) -> List[SerializablePerNeuronValue]:
    datastore = load_datastore(path_to_datastore)
    ads = cast(Any, datastore.get_analysis_result(
        identifier=AdsIdentifier.PerNeuronValue.value,
        analysis_algorithm=alg,
        **kwargs
    ))

    return [cast(SerializablePerNeuronValue, {
        'ids': a.ids,
        'values': a.values,
        **__get_ads_base(a)
    }) for a in ads]


def get_per_neuron_pair_value(path_to_datastore: str, alg: str, **kwargs) -> List[SerializablePerNeuronPairValue]:
    datastore = load_datastore(path_to_datastore)
    ads = cast(Any, datastore.get_analysis_result(
        identifier=AdsIdentifier.PerNeuronPairValue.value,
        analysis_algorithm=alg,
        **kwargs
    ))

    return [cast(SerializablePerNeuronValue, {
        'ids': a.ids,
        'values': {
            '@link': 'analysis_ds/pnpv?' +
            urlencode(flask.request.args.to_dict()),
            'dimensions': [len(a.ids)] * 2
        },
        **__get_ads_base(a)
    }) for a in ads]


def iter_pnpv_values(path_to_datastore: str, alg: str, stimulus_id, **kwargs):
    datastore = load_datastore(path_to_datastore)
    ads = cast(List[Any], datastore.get_analysis_result(
        identifier=AdsIdentifier.PerNeuronPairValue.value,
        analysis_algorithm=alg,
        **kwargs
    ))
    for a in ads:
        if ast.literal_eval(a.stimulus_id) == stimulus_id:
            for row in a.values:
                yield row
            break


def get_analog_signal_list(path_to_datastore: str, alg: str, **kwargs) -> List[SerializableASL]:
    datastore = load_datastore(path_to_datastore)
    ads = cast(Any, datastore.get_analysis_result(
        identifier=AdsIdentifier.AnalogSignalList.value,
        analysis_algorithm=alg,
        **kwargs
    ))

    return [cast(SerializablePerNeuronValue, {
        'ids': [int(id) for id in a.ids],
        'values': [
            [
                [None if math.isnan(i) else i for i in pair]
                for pair in analog_signal
            ]
            for analog_signal in a.asl
        ],
        **__get_ads_base(a)
    }) for a in ads]


def __get_ads_base(ads: Any) -> Ads:
    return cast(Ads, {
        'algorithm': ads.analysis_algorithm,
        'identifier': ads.identifier,
        'tags': list(sorted(ads.tags)),
        'neuron': safe_check(ads, 'neuron') and int(ads.neuron),
        'sheet': ads.sheet_name,
        'stimulus': ads.stimulus_id and ast.literal_eval(ads.stimulus_id),
        'period': safe_check(ads, 'period') and float(ads.period),
        'unit': safe_check(ads, 'value_units') or '',
        'valueName': safe_check(ads, 'value_name'),
    })


def safe_check(obj, prop):
    return getattr(obj, prop, None)
