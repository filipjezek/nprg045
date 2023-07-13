import flask
from .transforms import AdsIdentifier, get_ads_list, get_per_neuron_value, \
    get_per_neuron_pair_value, get_analog_signal_list, iter_pnpv_values, iter_asl_values, Ads
from ..utils import generate_csv, get_path
from ...utils import filter_empty
from typing import Dict, Sequence
import json

analysis_ds = flask.Blueprint("analysis_ds", __name__)


@analysis_ds.route('all')
def get_ads():
    try:
        path = get_path()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_ads_list(str(path)))


@analysis_ds.route('')
def get_specific_ads():
    try:
        args = flask.request.args
        path = get_path()
        alg = args['algorithm']
        identifier = AdsIdentifier(args['identifier'])
        optional, stimulus_id = get_optional_ads_params()

    except:
        return flask.Response(status=400)
    match identifier:
        case AdsIdentifier.PerNeuronValue:
            a = get_per_neuron_value(
                str(path),
                alg,
                **optional
            )
        case AdsIdentifier.PerNeuronPairValue:
            a = get_per_neuron_pair_value(
                str(path),
                alg,
                **optional
            )
        case AdsIdentifier.AnalogSignalList:
            a = get_analog_signal_list(
                str(path),
                alg,
                **optional
            )
        case _:
            return flask.Response(status=400)
    a = filter_stimuli(stimulus_id, a)
    if len(a) == 0:
        return flask.Response(status=404)
    return flask.jsonify(a[0])


@analysis_ds.route('pnpv')
def get_pnpv_values():
    try:
        args = flask.request.args
        path = get_path()
        alg = args['algorithm']
        optional, stimulus_id = get_optional_ads_params()
    except:
        return flask.Response(status=400)

    return generate_csv(
        iter_pnpv_values(str(path), alg, stimulus_id, **optional)
    ), {"Content-Type": "text/csv"}


@analysis_ds.route('asl')
def get_asl_values():
    try:
        args = flask.request.args
        path = get_path()
        alg = args['algorithm']
        optional, stimulus_id = get_optional_ads_params()
    except:
        return flask.Response(status=400)

    return generate_csv(
        iter_asl_values(str(path), alg, stimulus_id, **optional)
    ), {"Content-Type": "text/csv"}


def filter_stimuli(stimulus: Dict, ads: Sequence[Ads]):
    """
    we cannot use `datastore.get_analysis_result` for this,
    because we would be comparing two stringified dicts
    with no guaranteeed order of their keys
    """
    return [
        ds for ds in ads if ds['stimulus'] == stimulus
    ]


def get_optional_ads_params():
    args = flask.request.args
    value_name = args.get('valueName', None)
    neuron = args.get('neuron', None)
    sheet = args.get('sheet', None)
    tags = args.getlist('tags', None)
    stimulus_id = json.loads(args.get('stimulus', 'null'))

    return filter_empty(
        value_name=value_name,
        sheet_name=sheet,
        neuron=neuron,
        tags=tags), stimulus_id
