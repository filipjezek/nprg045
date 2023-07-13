import flask
from .ads import analysis_ds
from .filesystem import fs
from .model import model

api = flask.Blueprint("api", __name__)
api.register_blueprint(analysis_ds, url_prefix='/analysis_ds/')
api.register_blueprint(fs, url_prefix='/fs/')
api.register_blueprint(model, url_prefix='/model/')
