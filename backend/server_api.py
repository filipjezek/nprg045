import flask
import json
from .ads import get_ads_list, AdsIdentifier, get_per_neuron_value, Ads, \
    get_per_neuron_pair_value, get_analog_signal_list, iter_pnpv_values
from .filesystem import find_datastores, get_directory
from .model import get_model as get_datastore_model, get_sheet_positions, get_connections
from .parameters import params
from .utils import filter_empty
from pathlib import Path
from typing import Iterator, Iterable, Dict, Sequence
import itertools as it

api = flask.Blueprint("api", __name__)


def generate_csv(source: Iterator[Iterable]) -> Iterator[str]:
    for row in source:
        yield ','.join(map(lambda x: '' if x is None else str(x), row)) + '\n'


def get_path() -> Path:
    path: Path = Path(flask.request.args['path']).resolve()
    assert any(map(lambda p: p in path.parents or p ==
               path, params['root_paths']))
    assert (path / 'datastore.recordings.pickle').is_file()
    return path


@api.route('model')
def get_model():
    try:
        path = get_path()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_datastore_model(str(path)))


@api.route('model/positions')
def get_model_positions():
    try:
        path = get_path()
        sheet = flask.request.args['sheet']
    except:
        return flask.Response(status=400)

    return generate_csv(
        get_sheet_positions(str(path), sheet)
    ), {"Content-Type": "text/csv"}


@api.route('model/connections')
def get_model_connections():
    try:
        path = get_path()
        src = flask.request.args['src']
        tgt = flask.request.args['tgt']
    except:
        return flask.Response(status=400)

    return generate_csv(
        get_connections(str(path), src, tgt)
    ), {"Content-Type": "text/csv"}


@api.route('recursive_filesystem')
def get_recursive_filesystem():
    if ('path' in flask.request.args):
        path = Path(flask.request.args['path']).resolve()
        if not any(map(lambda p: p in path.parents or p == path, params['root_paths'])):
            return flask.Response(status=400)
        return flask.jsonify(find_datastores(path))

    content = list(map(find_datastores, params['root_paths']))
    for ds, p in zip(content, params['root_paths']):
        ds['name'] = str(p.parent / ds['name'])[1:] or '.'

    return flask.jsonify({
        'name': '/',
        'datastore': False,
        'content': content
    })


@api.route('filesystem')
def get_filesystem():
    if ('path' in flask.request.args):
        path = Path(flask.request.args['path']).resolve()
        if not any(map(lambda p: p in path.parents or p == path, params['root_paths'])):
            return flask.Response(status=400)
        return flask.jsonify(get_directory(path))
    return flask.jsonify({
        'name': '/',
        'datastore': False,
        'content': list(map(lambda p: str(p)[1:] or '.', params['root_paths']))
    })


@api.route('analysis_ds_list')
def get_ads():
    try:
        path = get_path()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_ads_list(str(path)))


@api.route('analysis_ds')
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


@api.route('analysis_ds/pnpv')
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
