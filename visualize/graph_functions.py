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
from bokeh.plotting import from_networkx
import networkx as nx


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
	connection_edges = [((i,source),(j,target),{'weight':w, 'delay':d})
						for ((i,j,w),(_,_,d))
						in zip(conn_weights,conn_delays)]

	G.add_edges_from(connection_edges)

def add_sheet_nodes_to_graph(G,datastore,sheet):
	positions = get_neuron_positions_on_sheet(datastore,sheet)
		
	node_indices = arange(len(positions['x']))
	nodes_with_sheet = [((i,sheet),
							{"coor":(positions['x'][i],positions['y'][i])})
						for i
						in node_indices]
		
	G.add_nodes_from(nodes_with_sheet)

def create_neuron_connections_graph(datastore):
	G = nx.DiGraph()

	for sheet in datastore.sheets():
		add_sheet_nodes_to_graph(G,datastore,sheet)

	connections = datastore.get_analysis_result(identifier='Connections')

	for conn in connections:
		c_weights = conn.weights
		c_delays = conn.delays
		add_connection_edges(G, conn.source_name, conn.target_name, c_weights, c_delays)

def graph_to_show(G,sheets,selection=None,edges_in=False):
		if selection == None:
			for sheet in sheets:
				graph = from_networkx(G(sheet=sheet))