import flask
from numpy import int64
from .ads import get_ads_list, AdsIdentifier, get_per_neuron_value
from .filesystem import find_datastores, get_directory
from .model import get_model as get_datastore_model
from .parameters import params
from pathlib import Path

api = flask.Blueprint("api", __name__)

def get_path() -> Path:
    path: Path = Path(flask.request.args['path']).resolve()
    assert any(map(lambda p: p in path.parents or p == path, params['root_paths']))
    assert (path / 'datastore.recordings.pickle').is_file()
    return path

@api.route('model')
def get_model():
    try:
        path = get_path()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_datastore_model(str(path)))

@api.route('recursive_filesystem')
def get_recursive_filesystem():
    if ('path' in flask.request.args):
        path = Path(flask.request.args['path']).resolve()
        if not any(map(lambda p: p in path.parents or p == path, params['root_paths'])):
            return flask.Response(status=400)
        return flask.jsonify(find_datastores(path))
    
    content = list(map(find_datastores, params['root_paths']))
    for ds, p in zip(content, params['root_paths']):
        ds['name'] = str(p)[1:] or '.' # strip slash
        
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
    