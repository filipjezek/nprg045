from pathlib import Path
import flask
from typing import Iterator, Iterable
from ..parameters import params


def generate_csv(source: Iterator[Iterable]) -> Iterator[str]:
    for row in source:
        yield ','.join(map(lambda x: '' if x is None else str(x), row)) + '\n'


def get_path() -> Path:
    path: Path = Path(flask.request.args['path']).resolve()
    assert any(map(lambda p: p in path.parents or p ==
               path, params['root_paths']))
    assert (path / 'datastore.recordings.pickle').is_file()
    return path
