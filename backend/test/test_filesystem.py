from pathlib import Path
import pytest

from ..api.filesystem.fs_access import find_datastores


@pytest.fixture()
def prepare_directory_structure(tmp_path: Path):
    """
    temp
        - a
            - c
                -d
                    -e (DS)
                        -f
                            -g (DS)
                                -h
                    -i
                        -j(DS)
        - b
            -f (DS)
    """
    h = tmp_path / 'a/c/d/e/f/g/h'
    h.mkdir(parents=True)
    f = tmp_path / 'b/f'
    f.mkdir(parents=True)
    j = tmp_path / 'a/c/d/i/j'
    j.mkdir(parents=True)

    (j / 'datastore.recordings.pickle').write_text("")
    (f / 'datastore.recordings.pickle').write_text("")
    (tmp_path / 'a/c/d/e/datastore.recordings.pickle').write_text("")
    (tmp_path / 'a/c/d/e/f/g/datastore.recordings.pickle').write_text("")


def test_find_datastores(tmp_path: Path, prepare_directory_structure):
    assert find_datastores(tmp_path) == {
        'name': tmp_path.name,
        'datastore': False,
        'content': [
            {
                'name': 'a/c/d',
                'datastore': False,
                'content': [
                    {
                        'name': 'e',
                        'datastore': True,
                        'content': [
                            {
                                'name': 'f/g',
                                'datastore': True,
                                'content': []
                            }
                        ]
                    },
                    {
                        'name': 'i/j',
                        'datastore': True,
                        'content': []
                    }
                ]
            },
            {
                'name': 'b/f',
                'datastore': True,
                'content': []
            }
        ]
    }
