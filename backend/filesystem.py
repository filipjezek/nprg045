from pathlib import Path
from .parameters import params
from typing import List, Tuple, TypedDict, Union

class FolderInfo(TypedDict):
    name: str
    datastore: bool
    content: List[str]

class RecursiveFolderInfo(TypedDict):
    name: str
    datastore: bool
    content: List[Union['RecursiveFolderInfo', 'FolderInfo']]


def find_datastores(path: Path) -> RecursiveFolderInfo:
    stores = get_directory(path)
    stores['content'] = list(
        filter(
            lambda p: len(p['content']) > 0 or p['datastore'],
            map(
                lambda p: find_datastores(path / p),
                stores['content']
            )
        ),
    )

    if len(stores['content']) == 1 and not stores['datastore']:
        # collapse long paths
        stores['datastore'] = stores['content'][0]['datastore']
        stores['name'] += '/' + stores['content'][0]['name']
        stores['content'] = stores['content'][0]['content']
    return stores

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
    
