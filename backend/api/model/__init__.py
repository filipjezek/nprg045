import flask
from ..utils import generate_csv, get_path
from .transforms import get_model as get_datastore_model, get_sheet_positions, get_connections

model = flask.Blueprint("model", __name__)


@model.route('')
def get_model():
    try:
        path = get_path()
    except:
        return flask.Response(status=400)
    return flask.jsonify(get_datastore_model(str(path)))


@model.route('positions')
def get_model_positions():
    try:
        path = get_path()
        sheet = flask.request.args['sheet']
    except:
        return flask.Response(status=400)

    return generate_csv(
        get_sheet_positions(str(path), sheet)
    ), {"Content-Type": "text/csv"}


@model.route('connections')
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
