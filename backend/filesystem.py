from pathlib import Path
from typing import List, TypedDict


class FolderInfo(TypedDict):
    name: str
    datastore: bool
    children: List['FolderInfo']

def find_datastores(path: Path) -> FolderInfo:
    return {
        'name': path.name,
        'datastore': path.joinpath('datastore.recordings.pickle').is_file(),
        'content': list(
            filter(
                lambda p: len(p['content']) > 0 or p['datastore'],
                map(
                    lambda p: find_datastores(p),
                    filter(lambda p: p.is_dir(), path.iterdir())
                )
            )
        )
    }