from flask import Flask
from flask_cors import CORS
from pathlib import Path
from .encoder import JSONEncoder
import os

app = Flask(
    __name__,
    instance_relative_config=True,
    instance_path=Path(__file__).joinpath('../instance').resolve(),
    root_path=Path(__file__).joinpath('..').resolve(),
    static_url_path='/',
    static_folder=Path(__file__).joinpath('../static').resolve(),
)


# Load the default configuration
app.config.from_object('backend.config.default')
if 'APP_MODE' in os.environ and os.environ['APP_MODE'] == 'prod':
    app.config.from_object('backend.config.production')

app.json = JSONEncoder(app)

cors = CORS(app)
