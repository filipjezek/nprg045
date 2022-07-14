from pathlib import Path
from typing import List, TypedDict


class FolderInfo(TypedDict):
    name: str
    datastore: bool
    children: List['FolderInfo']

def find_datastores(path: Path) -> FolderInfo:
    stores = {
        'name': path.name,
        'datastore': path.joinpath('datastore.recordings.pickle').is_file(),
        'content': list(
            sorted(
                filter(
                    lambda p: len(p['content']) > 0 or p['datastore'],
                    map(
                        lambda p: find_datastores(p),
                        filter(lambda p: p.is_dir(), path.iterdir())
                    )
                ),
                key=lambda dir: dir['name']
            )
        )
    }
    if len(stores['content']) == 1 and not stores['datastore']:
        # collapse long paths
        stores['datastore'] = stores['content'][0]['datastore']
        stores['name'] += '/' + stores['content'][0]['name']
        stores['content'] = stores['content'][0]['content']
    return stores