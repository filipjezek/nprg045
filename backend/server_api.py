import flask
from .app import app
from .datastore import curr_datastore

api = flask.Blueprint("api", __name__)

@api.route('model')
def get_model():
    return flask.jsonify(curr_datastore)