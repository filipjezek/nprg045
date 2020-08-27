#!/usr/bin/env python3
import sys

from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters, PyNNDistribution
from mozaik.storage.datastore import Hdf5DataStore,PickledDataStore
from mozaik.analysis.data_structures import Connections
from mozaik.storage import queries

from parameters import UniformDist
from json import JSONEncoder
from parameters import ParameterSet

from numpy import array, resize, where, arange
from math import ceil

import networkx as nx

from bokeh.plotting import figure, output_file, show

# --- testing requiremets ---
import pytest
import mock
from pytest_mock import mocker

from visualize import graph_functions
# ---

def test_add_sheet_nodes_to_empty_graph(mocker):
    mocker.patch(
        'visualize.graph_functions.get_neuron_positions_on_sheet',
        return_value = {'x': [ 2.0, 2.0, 3.0],
                        'y': [ 1.0, 2.0, 1.0]}
    )

    expected = nx.DiGraph()
    expected.add_nodes_from([((0,"SHEET"),{"coor":(2,1)}),
                             ((1,"SHEET"),{"coor":(2,2)}),
                             ((2,"SHEET"),{"coor":(3,1)})])

    result = nx.DiGraph()
    graph_functions.add_sheet_nodes_to_graph(result,None,"SHEET")
    
    assert expected.nodes == result.nodes
    
def test_add_sheet_nodes_to_graph_empty_sheet(mocker):
    mocker.patch(
        'visualize.graph_functions.get_neuron_positions_on_sheet',
        return_value = {'x': [],
                        'y': []}
    )

    expected = nx.DiGraph()
    expected.add_nodes_from([])

    result = nx.DiGraph()
    graph_functions.add_sheet_nodes_to_graph(result,None,"SHEET")
    
    assert expected.nodes == result.nodes

def test_add_sheet_nodes_same_node_index_different_sheets(mocker):
    mocker.patch(
        'visualize.graph_functions.get_neuron_positions_on_sheet',
        return_value = {'x': [ 2.0, 2.0, 3.0],
                        'y': [ 1.0, 2.0, 1.0]}
    )

    expected = nx.DiGraph()
    expected.add_nodes_from([((0,"SHEET"),{"coor":(2,1)}),
                             ((1,"SHEET"),{"coor":(2,2)}),
                             ((2,"SHEET"),{"coor":(3,1)}),
                             ((0,"SHEET_2"),{"coor":(2,1)})])

    result = nx.DiGraph()
    result.add_nodes_from([((0,"SHEET_2"),{"coor":(2,1)})])
    graph_functions.add_sheet_nodes_to_graph(result,None,"SHEET")
    
    assert expected.nodes == result.nodes
    
def test_add_sheet_nodes_to_empty_graph_coors(mocker):
    mocker.patch(
        'visualize.graph_functions.get_neuron_positions_on_sheet',
        return_value = {'x': [ 2.0, 2.0, 3.0],
                        'y': [ 1.0, 2.0, 1.0]}
    )

    expected = nx.DiGraph()
    expected.add_nodes_from([((0,"SHEET"),{"coor":(2,1)}),
                             ((1,"SHEET"),{"coor":(2,2)}),
                             ((2,"SHEET"),{"coor":(3,1)})])

    result = nx.DiGraph()
    graph_functions.add_sheet_nodes_to_graph(result,None,"SHEET")
    
    assert expected.nodes[(0,"SHEET")]["coor"] == result.nodes[(0,"SHEET")]["coor"]
    
def test_add_connection_edges():
    result = nx.DiGraph()
    result.add_nodes_from([(0,"A"),(1,"A"),(0,"B")])
   
    expected = result.copy()
    expected.add_edges_from([((0,"A"),(0,"B"),{'weight':1, 'delay':1}),
                             ((1,"A"),(0,"B"),{'weight':1, 'delay':1})])
    
    graph_functions.add_connection_edges(result, "A", "B", [(0,0,1),(1,0,1)], [(0,0,1),(1,0,1)])
    
    assert expected.out_edges == result.out_edges
    
def test_add_connection_edges_attributes():
    result = nx.DiGraph()
    result.add_nodes_from([(0,"A"),(1,"A"),(0,"B")])
    
    expected = result.copy()
    expected.add_edges_from([((0,"A"),(0,"B"),{'weight':1, 'delay':1})])
    
    graph_functions.add_connection_edges(result, "A", "B", [(0,0,1)], [(0,0,1)])
    
    expected_dict = expected.out_edges[((0,"A"),(0,"B"))]
    result_dict = result.out_edges[((0,"A"),(0,"B"))]
    
    assert expected_dict == result_dict
    