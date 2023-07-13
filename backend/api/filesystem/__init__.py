import flask
from pathlib import Path
from .fs_access import find_datastores, get_directory
from ...parameters import params

fs = flask.Blueprint("fs", __name__)


@fs.route('recursive')
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


@fs.route('directory')
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
