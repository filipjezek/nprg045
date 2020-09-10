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

from numpy import arange
from bokeh.plotting import figure, curdoc, from_networkx, show
from bokeh.models import HoverTool, Plot, GraphRenderer,Div

import networkx as nx
from functools import partial


def get_datastore(path_to_datastore):
	datastore = PickledDataStore(
					load=True,
					parameters=ParameterSet(
						{'root_directory': path_to_datastore ,'store_stimuli' : False}),
					replace=False)
	return datastore

def get_neuron_positions_on_sheet(datastore, sheet):
	positions = {
		'x' : datastore.get_neuron_positions()[sheet][0],
		'y' : datastore.get_neuron_positions()[sheet][1]
	}
		
	return positions

def add_connection_edges(G, source, target, conn_weights, conn_delays):
	connection_edges = [(i+source,j+target,{'weight':w, 'delay':d})
						for ((i,j,w),(_,_,d))
						in zip(conn_weights,conn_delays)]

	G.add_edges_from(connection_edges)

def add_sheet_nodes_to_graph(G,datastore,n,sheet):
	positions = get_neuron_positions_on_sheet(datastore,sheet)
	
	number_of_nodes = len(positions['x'])
	node_indices = [i for i in range(number_of_nodes)]
	nodes_with_sheet = [(i+n,{"coor":(positions['x'][i],positions['y'][i])})
						for i
						in node_indices]
		
	G.add_nodes_from(nodes_with_sheet,sheet=sheet)

	return n + number_of_nodes

def create_neuron_connections_graph(datastore):
	G = nx.DiGraph()

	sheet_nodes_start_number = {}
	n = 0

	for sheet in datastore.sheets():
		sheet_nodes_start_number[sheet] = n
		n = add_sheet_nodes_to_graph(G,datastore,n,sheet)

	connections = datastore.get_analysis_result(identifier='Connections')

	for conn in connections:
		c_weights = conn.weights
		c_delays = conn.delays
		add_connection_edges(G,
							sheet_nodes_start_number[conn.source_name],
							sheet_nodes_start_number[conn.target_name],
							c_weights, c_delays)

	return G

def create_sheet_graph_renderer(G,sheet):
	sheet_nodes = [(n,attr) for n,attr in G.nodes(data=True) if attr["sheet"]==sheet]
	sheet_subgraph = nx.DiGraph()
	sheet_subgraph.add_nodes_from(sheet_nodes)
	layout = get_nodes_layout(sheet_subgraph)
	graph_renderer = from_networkx(sheet_subgraph,layout)

	graph_renderer.node_renderer.data_source.add([0] * len(sheet_nodes), 'selected')

	return graph_renderer

def get_nodes_layout(G):
	layout = {n:G.nodes[n]["coor"] for n in G.nodes()}
	return layout

def get_neighbors(node,nx_graph,edges_in):
	neighbors = []
	if edges_in:
		neighbors = nx_graph.predecessors(node)
	else:
		neighbors = nx_graph.successors(node)

	return neighbors
