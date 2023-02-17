from pathlib import Path
from .parameters import params
from typing import List, Tuple, TypedDict, Union, cast


class FolderInfo(TypedDict):
    name: str
    datastore: bool
    content: List[str]


class RecursiveFolderInfo(TypedDict):
    name: str
    datastore: bool
    content: List[Union['RecursiveFolderInfo', 'FolderInfo']]


__ignored_folders = {'node_modules'}


def find_datastores(path: Path, level=0) -> RecursiveFolderInfo:
    stores = get_directory(path)
    content = list(
        filter(
            lambda p: len(p['content']) > 0 or p['datastore'],
            map(
                lambda p: find_datastores(path / p, level + 1),
                filter(lambda p: not (len(p) > 1 and p.startswith('.'))
                       and p not in __ignored_folders,  stores['content'])
            )
        ),
    )

    if len(content) == 1 and not stores['datastore'] and level > 0:
        # collapse long paths
        stores['datastore'] = content[0]['datastore']
        stores['name'] += '/' + content[0]['name']
        content = content[0]['content']
    return {
        'name': stores['name'],
        'content': cast(List[Union['RecursiveFolderInfo', 'FolderInfo']], content),
        'datastore': stores['datastore']
    }


def get_directory(path: Path) -> FolderInfo:
    try:
        return {
            'name': path.name,
            'datastore': path.joinpath('datastore.recordings.pickle').is_file(),
            'content': list(
                sorted(
                    map(
                        lambda p: p.name,
                        filter(lambda p: p.is_dir(), path.iterdir())
                    )
                )
            )
        }
    except PermissionError:
        return {
            'name': path.name,
            'datastore': False,
            'content': []
        }


def merge_paths(paths: List[Path]) -> Tuple[Path, List[Path]]:
    root = Path('/')
    parts = [p.parts for p in paths]

    i = 0
    while all(map(lambda p: len(p) > i and p[i] == parts[0][i], parts)):
        root /= parts[0][i]
        i += 1
    branches = [
        Path('/'.join(p[i:])) for p in parts
    ]
    branches.sort(key=lambda p: str(p))
    return root, branches
