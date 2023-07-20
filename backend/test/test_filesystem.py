from pathlib import Path
import pytest

from ..api.filesystem.fs_access import find_datastores, get_directory, merge_paths


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


def test_get_directory(tmp_path: Path, prepare_directory_structure):
    assert get_directory(tmp_path / 'a/c/d') == {
        'name': 'd',
        'datastore': False,
        'content': [
            'e',
            'i'
        ]
    }
    assert get_directory(tmp_path / 'a/c/d/e') == {
        'name': 'e',
        'datastore': True,
        'content': [
            'f'
        ]
    }


def test_merge_paths(tmp_path: Path):
    assert merge_paths([
        tmp_path / 'a/c/d/e/f/g',
        tmp_path / 'a/c/d/e/f/g/h'
    ]) == (tmp_path / 'a/c/d/e/f/g', [Path('.'), Path('h')])
    assert merge_paths([
        tmp_path / 'a/c/d/e/f/g',
        tmp_path / 'a/c/foo/bar/baz',
        tmp_path / 'a/c/d/e/f/g/h'
    ]) == (tmp_path / 'a/c', [Path('d/e/f/g'), Path('d/e/f/g/h'), Path('foo/bar/baz')])
