from .app import app
from .api import api
from werkzeug.exceptions import NotFound
import flask

app.register_blueprint(api, url_prefix='/api/')


@app.errorhandler(404)
def serve_spa(error: NotFound):
    try:
        return flask.send_from_directory(app.static_folder + '/frontend_dist', flask.request.path[1:])
    except NotFound:
        return app.send_static_file('frontend_dist/index.html')
