import sys
from typing import TypedDict
from pathlib import Path

class BackendParams(TypedDict):
    root_path: str

params: BackendParams = {
    'root_path': Path(__file__).joinpath('../../../').resolve()
}