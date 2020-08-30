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
from bokeh.models import (BoxZoomTool, Circle, HoverTool,
                          MultiLine, Plot, Range1d, ResetTool,)
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
	connection_edges = [(i+source,j+target,{'weight':w, 'delay':d})
						for ((i,j,w),(_,_,d))
						in zip(conn_weights,conn_delays)]

	G.add_edges_from(connection_edges)

def add_sheet_nodes_to_graph(G,datastore,n,sheet):
	positions = get_neuron_positions_on_sheet(datastore,sheet)
		
	node_indices = [i for i in range(len(positions['x']))]
	nodes_with_sheet = [(i+n,{"coor":(positions['x'][i],positions['y'][i])})
						for i
						in node_indices]
		
	G.add_nodes_from(nodes_with_sheet,sheet=sheet)

def create_neuron_connections_graph(datastore):
	G = nx.DiGraph()

	sheet_nodes_start_number = {}

	for sheet in datastore.sheets():
		n = G.number_of_nodes() # maybe do it faster?
		sheet_nodes_start_number[sheet] = n
		add_sheet_nodes_to_graph(G,datastore,n,sheet)

	connections = datastore.get_analysis_result(identifier='Connections')

	for conn in connections:
		c_weights = conn.weights
		c_delays = conn.delays
		add_connection_edges(G,
							sheet_nodes_start_number[conn.source_name],
							sheet_nodes_start_number[conn.target_name],
							c_weights, c_delays)

	return G


def sheet_graph_to_show(G,sheet):
	
	sheet_nodes = [n for n,attr in G.nodes(data=True) if attr["sheet"]==sheet]
	sheet_subgraph = G.subgraph(sheet_nodes)
	layout = {n:sheet_subgraph.nodes[n]["coor"] for n in sheet_subgraph.nodes()}
	graph = from_networkx(sheet_subgraph,layout)

	return graph

def graph_according_selection(G,selection=[],edges_in=False):

	selected_edges = []
	nodes = G.nodes(data=True)
 
	graph_to_show = nx.DiGraph()
	graph_to_show.add_nodes_from(nodes, selected=0)
	
	for selected_node in selection:
		graph_to_show.nodes[selected_node]["selected"] = 1

		neighbors = []
		if edges_in==False:
			neighbors = G.successors(selected_node)
		else:
			neighbors = G.predecessors(selected_node)

		for n in neighbors:
			if graph_to_show.nodes[n]["selected"] == 0:
				graph_to_show.nodes[n]["selected"] = 2
			if nodes[n]["sheet"]==nodes[selected_node]["sheet"]:
				if edges_in==False:
					selected_edges.append((selected_node,n,G[selected_node][n]))
				else:
					selected_edges.append((n,selected_node,G[n][selected_node]))

	graph_to_show.add_edges_from(selected_edges)

	return graph_to_show