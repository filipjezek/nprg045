import flask
from numpy import int64
from .ads import get_ads_list, AdsIdentifier, get_per_neuron_value
from .filesystem import find_datastores
from .model import get_model as get_datastore_model
from .parameters import params
from pathlib import Path

api = flask.Blueprint("api", __name__)

def get_path() -> Path:
    path: Path = (params['root_path'] / '..' / flask.request.args['path']).resolve()
    assert params['root_path'] in path.parents or params['root_path'] == path
    assert (path / 'datastore.recordings.pickle').is_file()
    return path

@api.route('model')
def get_model():
    try:
        path = get_path()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_datastore_model(str(path)))

@api.route('filesystem')
def get_filesystem():
    return flask.jsonify(find_datastores(params['root_path']))

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
        tags = args.getlist('tags')
    except:
        return flask.Response(status=400)
    match identifier:
        case AdsIdentifier.PerNeuronValue:
            a = get_per_neuron_value(str(path), alg, tags)
            for i in a:
                try:
                    flask.jsonify(i)
                except:
                    for x in i['ids']:
                        if type(x) == int64:
                            print('culprit is id')
                    for x in i['values']:
                        if type(x) == int64:
                            print('culprit is value')
                    if type(i['period']) == int64:
                        print('culprit is period')
                    print(i)
            return flask.jsonify(a)
        case _:
            return flask.Response(status=400)
    