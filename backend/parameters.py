import os
from typing import TypedDict
from pathlib import Path

class BackendParams(TypedDict):
    root_path: Path
    
def init_params() -> BackendParams:
    path = Path(os.environ['BACKEND_ROOT'] if 'BACKEND_ROOT' in os.environ else os.getcwd())
    if not path.is_absolute():
        path = Path(os.getcwd()) / path
    
    return {
        'root_path': path.resolve()
    }

params = init_params()
