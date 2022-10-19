import os
from typing import List, TypedDict
from pathlib import Path

class BackendParams(TypedDict):
    root_paths: List[Path]
    
def init_params() -> BackendParams:
    paths = os.environ['BACKEND_ROOT'].split(';') if 'BACKEND_ROOT' in os.environ else [os.getcwd()]
    for i in range(len(paths)):
        p = Path(paths[i])
        if not p.is_absolute():
            p = Path(os.getcwd()) / p
        paths[i] = p.resolve()
    
    return {
        'root_paths': paths,
    }

params = init_params()
