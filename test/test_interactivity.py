#!/usr/bin/env python3
import sys

import pytest

import networkx as nx
from bokeh.models import Range1d
from visualize import interactivity

def test_get_ranges():
	coors_list = [(0,0),(-1,0),(0,1),(-2,3),(1,-1)]

	expected = (Range1d(-2,1),Range1d(-1,3))
	result = interactivity.get_ranges(coors_list)
 
	assert expected[0].start == result[0].start
	assert expected[0].end == result[0].end
	assert expected[1].start == result[1].start
	assert expected[1].end == result[1].end
 
def test_get_ranges_empty():
	coors_list = []

	expected = (Range1d(-0.1,0.1),Range1d(-0.1,0.1))
	result = interactivity.get_ranges(coors_list)
 
	assert expected[0].start == result[0].start
	assert expected[0].end == result[0].end
	assert expected[1].start == result[1].start
	assert expected[1].end == result[1].end
 
def test_append_edge_to_empty_edges_dict():
	g = nx.DiGraph()
	g.add_nodes_from([0,1,2])
	g.add_edges_from([(1,2,{'weight':3, 'delay':4})])

	expected = {'start':[1], 'end':[2], 'weight':[3],'delay':[4]}

	result = {'start':[], 'end':[], 'weight':[],'delay':[]}
	interactivity.append_edge_to_edges_dict(result, g, 1, 2)
 
	assert expected == result
 
def test_append_edge_to_edges_dict():
	g = nx.DiGraph()
	g.add_nodes_from([0,1,2])
	g.add_edges_from([(1,2,{'weight':3, 'delay':4})])

	expected = {'start':[4,1], 'end':[3,2], 'weight':[2,3],'delay':[1,4]}

	result = {'start':[4], 'end':[3], 'weight':[2],'delay':[1]}
	interactivity.append_edge_to_edges_dict(result, g, 1, 2)
 
	assert expected == result