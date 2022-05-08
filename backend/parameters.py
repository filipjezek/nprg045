import sys
from typing import TypedDict
from pathlib import Path

class BackendParams(TypedDict):
  datastore_path: str

params: BackendParams = {
  # 'datastore_path': sys.argv[1]
  'datastore_path': str(Path(__file__).joinpath('../../example_data/').resolve())
}