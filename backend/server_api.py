import flask
from .app import app

api = flask.Blueprint("api", __name__)

@api.errorhandler(404)
def own_404_page(error):
    print(404)
    return api.send_static_file('frontend_dist/index.html')

@api.route('/<path:path>')
def static_proxy(path):
    print(app.config['STATIC_PATH'])
    print(app.config['STATIC_PATH'] + 'frontend_dist/' + path)
    return flask.send_from_directory(app.config['STATIC_PATH'] + 'frontend_dist/' + path)