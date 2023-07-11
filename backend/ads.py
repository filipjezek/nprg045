from enum import Enum
from typing import List, TypedDict, cast, Any, Dict
from .model import load_datastore
from .utils import batched
from urllib.parse import urlencode
import ast
import flask
import quantities as pq
import math


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
    values: AdsLink
    startTime: float
    timeUnit: str
    samplingPeriod: float
    ids: List[int]


def __convert_numeric(val):
    if isinstance(val, pq.Quantity):
        val = val.magnitude
    if math.isnan(val):
        return None
    else:
        return val


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

    ads_list.extend(sorted(
        (cast(Ads, {
            'algorithm': 'connection storage',
            'identifier': AdsIdentifier.Connections.value,
            'tags': None,
            'neuron': None,
            'sheet': s,
            'stimulus': None,
            'period': None,
            'unit': None,
            'valueName': None
        }) for s in datastore.get_neuron_positions()),
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
        'values': [__convert_numeric(a) for a in a.values],
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

    assert all(map(lambda ls: ls.shape == ads[0].asl[0].shape,
               ads[0].asl)), "all analog signals should be the same length"
    return [cast(SerializableASL, {
        'ids': a.ids,
        'timeUnit': a.asl[0].t_start,
        'startTime': a.asl[0].t_start.magnitude,
        'samplingPeriod': a.asl[0].sampling_period.magnitude,
        'values': {
            '@link': 'analysis_ds/asl?' +
            urlencode(flask.request.args.to_dict()),
            'dimensions': [len(a.asl), a.asl[0].shape[0]]
        },
        **__get_ads_base(a)
    }) for a in ads]


def iter_asl_values(path_to_datastore: str, alg: str, stimulus_id, **kwargs):
    datastore = load_datastore(path_to_datastore)
    ads = cast(List[Any], datastore.get_analysis_result(
        identifier=AdsIdentifier.AnalogSignalList.value,
        analysis_algorithm=alg,
        **kwargs
    ))
    for a in ads:
        if ast.literal_eval(a.stimulus_id) == stimulus_id:
            for ls in a.asl:
                for row in batched(ls.flat, 500):
                    yield row
            break


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
