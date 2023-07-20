from typing import List, Tuple
import pytest
from pytest_mock import MockerFixture
import numpy as np


class DataStoreMock():
    analysis_results = []

    def __init__(self, mocker: MockerFixture):
        self.get_analysis_result = mocker.stub(name="get_analysis_result")
        self.get_neuron_positions = mocker.stub(name="get_neuron_positions")
        self.get_sheet_ids = mocker.stub(name="get_sheet_ids")


class FlaskRequestArgsMock():
    def __init__(self, mocker: MockerFixture):
        self.to_dict = mocker.stub(name="to_dict")


class FlaskRequestMock():
    def __init__(self, mocker: MockerFixture):
        self.args = FlaskRequestArgsMock(mocker)


class KWassigner():
    def __init__(self, **kwargs):
        for key in kwargs:
            self.__setattr__(key, kwargs[key])


class DSAdsMock(KWassigner):
    analysis_algorithm: str
    identifier: str
    tags: List[str] = []


class QuantitiesMock(KWassigner):
    class Dimensionality(KWassigner):
        unicode: str
    dimensionality: Dimensionality
    magnitude: float


class DSPnvMock(KWassigner):
    analysis_algorithm: str
    identifier: str
    neuron: int
    sheet_name: str
    stimulus_id: str
    ids: List[int]
    period: float
    value_units: QuantitiesMock
    value_name: str
    values: np.ndarray
    tags: List[str]


class DSPnpvMock(KWassigner):
    identifier: str
    neuron: int
    sheet_name: str
    stimulus_id: str
    analysis_algorithm: str
    ids: List[int]
    period: float
    value_units: QuantitiesMock
    value_name: str
    values: np.ndarray
    tags: List[str]


class AslMock(KWassigner):
    t_start: QuantitiesMock
    sampling_period: QuantitiesMock
    shape: Tuple[int, int]
    flat: List[float]

    def __iter__(self):
        return self.flat.__iter__()


class DSAslMock(KWassigner):
    identifier: str
    neuron: int
    sheet_name: str
    stimulus_id: str
    analysis_algorithm: str
    ids: List[int]
    period: float
    value_units: QuantitiesMock
    value_name: str
    asl: List[AslMock]
    tags: List[str]


class MozaikConnectionMock(KWassigner):
    source_name: str  # sheet
    target_name: str  # sheet
    weights: List[Tuple[int, int, float]]  # (src index, tgt index, value)
    delays: List[Tuple[int, int, float]]  # (src index, tgt index, value)
