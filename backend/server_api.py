import flask
from .filesystem import find_datastores
from .datastore import get_datastore
from .parameters import params

api = flask.Blueprint("api", __name__)

@api.route('model')
def get_model():
    try:
        path = params['root_path'] / flask.request.args['path']
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_datastore(str(path)))

@api.route('datastores')
def get_datastores():
    return flask.jsonify(find_datastores(params['root_path']))