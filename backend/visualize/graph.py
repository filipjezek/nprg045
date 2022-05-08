#!/usr/bin/env python3

from typing import  TypedDict
from mozaik.storage.datastore import PickledDataStore, DataStore
from parameters import ParameterSet
from bokeh.plotting import from_networkx
import networkx as nx
import numpy as np

class Positions(TypedDict):
  x: np.ndarray
  y: np.ndarray


def get_datastore(path_to_datastore: str) -> DataStore:
	"""
	path_to_datastore: absolute path to mozaik datastore
	"""
	datastore = PickledDataStore(
					load=True,
					parameters=ParameterSet(
						{'root_directory': path_to_datastore ,'store_stimuli' : False}),
					replace=False)

	return datastore

def get_neuron_positions_on_sheet(datastore: DataStore, sheet: str) -> Positions:
	"""
	datastore: mozaik datastore
	sheet: sheet name
	"""
	positions = {
		'x' : datastore.get_neuron_positions()[sheet][0],
		'y' : datastore.get_neuron_positions()[sheet][1]
	}
		
	return positions

def add_connection_edges(nx_graph: nx.DiGraph, source: int, target: int, conn_weights, conn_delays):
	"""
	add edges to nx_graph
	nx_graph: networkx DiGraph
	source: source sheet nodes indicies start number
	target: target sheet nodes indicies start number
	conn_weights, conn_delays: lists of 3-tuples (source node id, target node id, weight/delay)
	"""
	connection_edges = [
    (
      i+source,
      j+target,
      {'weight':w, 'delay':d}
    )
		for ((i,j,w), (_,_,d)) in zip(conn_weights,conn_delays)
	]

	nx_graph.add_edges_from(connection_edges)

def add_sheet_nodes_to_graph(nx_graph: nx.DiGraph, datastore: DataStore, n: int, sheet: str):
	"""
	add nodes from given sheet to nx_graph, return number of nodes in graph after that
	nx_graph: networkx DiGraph
	datastore: mozaik datastore
	n: number of nodes in nx_graph before
	sheet: string name of sheet of nodes to be added	
	"""
	positions = get_neuron_positions_on_sheet(datastore,sheet)
	
	number_of_nodes = len(positions['x'])
	node_indices = [i for i in range(number_of_nodes)]
	nodes_with_sheet = [
    (
      i+n, {
      	'coor': (positions['x'][i], positions['y'][i])
    	}
    )
		for i in node_indices
  ]
		
	nx_graph.add_nodes_from(nodes_with_sheet,sheet=sheet)

	return n + number_of_nodes

def create_neuron_connections_graph(datastore: DataStore):
	"""
	get mozaik datastore and returns networkx graph of neurons and its connections
	includig info about neurons positions and connections weight and delay
	"""
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

def create_sheet_graph_renderer(nx_graph: nx.DiGraph, sheet):
	"""
	creates bokeh GraphRenderer for given sheet from networkx graph od neurons and connections
	"""
	sheet_nodes = [(n,attr) for n,attr in nx_graph.nodes(data=True) if attr['sheet']==sheet]
	sheet_subgraph = nx.DiGraph()
	sheet_subgraph.add_nodes_from(sheet_nodes)
	layout = get_nodes_layout(sheet_subgraph)
	graph_renderer = from_networkx(sheet_subgraph,layout)

	graph_renderer.node_renderer.data_source.add([0] * len(sheet_nodes), 'selected')

	graph_renderer.node_renderer.data_source.add([0] * len(sheet_nodes), 'weight')
	graph_renderer.node_renderer.data_source.add([0] * len(sheet_nodes), 'delay')

	graph_renderer.edge_renderer.data_source.data = {'start':[], 'end':[], 'weight':[],'delay':[]}

	return graph_renderer

def get_nodes_layout(nx_graph: nx.DiGraph):
	"""
	extract coordinates od nodes from networkx graph with node attribute "coor":(x,y)
	"""
	layout = {n:nx_graph.nodes[n]['coor'] for n in nx_graph.nodes()}
	return layout

def get_neighbors(node, nx_graph: nx.DiGraph, edges_in: bool):
	"""
	returns predecessors/successors od node in networkx DiGraph
	according edges_in True/False flag
	"""
	neighbors = []
	if edges_in:
		neighbors = nx_graph.predecessors(node)
	else:
		neighbors = nx_graph.successors(node)

	return neighbors
