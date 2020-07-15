#!/usr/bin/env python3

from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters, PyNNDistribution
from mozaik.storage.datastore import Hdf5DataStore,PickledDataStore
from mozaik.analysis.data_structures import Connections
from mozaik.storage import queries

from parameters import UniformDist # right? (source: https://pythonhosted.org/NeuroTools/parameters.html)
from json import JSONEncoder # right? (source: https://docs.python.org/3/library/json.html#module-json)
from parameters import ParameterSet

from bokeh.plotting import figure, output_file, show

# --- testing requiremets ---
import pytest
from visualize import visualise_bokeh
# ---

def test_get_plot_output_type():
    test_data_store = PickledDataStore(load=True, parameters=ParameterSet({'root_directory': '/home/katerina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student' ,'store_stimuli' : False}), replace=False)

    test_sheet = test_data_store.sheets()[0]

    result = visualise_bokeh.get_plot(test_data_store,test_sheet)
    expected = figure()
    
    assert type(result) is type(expected)


def test_prepare_plots_grid_without_padding():

    result = visualise_bokeh.prepare_plots_grid([1,1,1],3)
    expected = [[1,1,1]]
    
    assert result == expected

def test_prepare_plots_grid_one_line_padding():

    result = visualise_bokeh.prepare_plots_grid([1,1],3)
    expected = [[1,1,None]]
    
    assert result == expected

def test_prepare_plots_grid_two_lines_padding():

    result = visualise_bokeh.prepare_plots_grid([1,1,1,1,1],3)
    expected = [[1,1,1],[1,1,None]]
    
    assert result == expected

