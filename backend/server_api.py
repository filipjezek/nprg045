import flask
from .filesystem import find_datastores
from .datastore import get_datastore
from .parameters import params
from pathlib import Path

api = flask.Blueprint("api", __name__)

@api.route('model')
def get_model():
    try:
        path: Path = params['root_path'] / '..' / flask.request.args['path']
        print(path)
        assert (path / 'datastore.recordings.pickle').is_file()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_datastore(str(path)))

@api.route('filesystem')
def get_filesystem():
    return flask.jsonify(find_datastores(params['root_path']))