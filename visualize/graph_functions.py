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

import networkx as nx


def get_datastore(path_to_datastore):
	data_store = PickledDataStore(
					load=True,
					parameters=ParameterSet(
						{'root_directory': path_to_datastore ,'store_stimuli' : False}),
					replace=False)
	return data_store

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
 
	return G

def add_sheet_nodes_to_graph(G,datastore,sheet):
	positions = get_neuron_positions_on_sheet(datastore,sheet)
		
	node_indices = arange(len(positions['x']))
	nodes_with_sheet = [((i,sheet),
							{"coor":(positions['x'][i],positions['y'][i])})
						for i
						in node_indices]
		
	G.add_nodes_from(nodes_with_sheet)
		
	return G

def add_edges_to_graph(G,datastore):
	raise NotImplementedError()