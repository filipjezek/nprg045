import flask
from .ads import ads_bp
from .filesystem import fs_bp
from .model import model_bp

api_bp = flask.Blueprint("api", __name__)
api_bp.register_blueprint(ads_bp, url_prefix='/analysis_ds/')
api_bp.register_blueprint(fs_bp, url_prefix='/fs/')
api_bp.register_blueprint(model_bp, url_prefix='/model/')
