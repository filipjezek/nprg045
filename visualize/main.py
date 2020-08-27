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

from bokeh.plotting import figure, curdoc
from bokeh.layouts import gridplot
from bokeh.models import ColumnDataSource, LassoSelectTool, TapTool

import holoviews as hv 
import datashader as ds
from holoviews.operation.datashader import datashade, shade, dynspread, rasterize, bundle_graph

from numpy import array, resize, where, arange
from math import ceil

import networkx as nx

from .graph_functions import *

#------------------------------------------------new

def add_sheet_nodes_to_graph(sheet):
    
	positions = {
		'x' : data_store.get_neuron_positions()[sheet][0],
		'y' : data_store.get_neuron_positions()[sheet][1]
	}

	return positions

#---------------------------------------------------

hv.extension('bokeh')

defaults = dict(width=800, height=800)
 
hv.opts.defaults(
    	hv.opts.EdgePaths(**defaults),
    	hv.opts.Graph(**defaults),
    	hv.opts.Nodes(**defaults)
    )



def connections_inside_layer(connections,nodes):
	c_source = [int(i) for (i,j,weight) in connections]
	c_target = [int(j) for (i,j,weight) in connections]
	edge_labels = [x for (i,j,x) in connections]
	g = hv.Graph(((c_source, c_target, edge_labels), nodes), vdims='weight')
	return g

def get_plot(data_store, sheet):
	"""
	Returns plot for the sheet.
	"""

	positions = {
		'x' : data_store.get_neuron_positions()[sheet][0],
		'y' : data_store.get_neuron_positions()[sheet][1]
	}

	#-----


	node_indices = arange(len(positions['x']))
	nodes = hv.Nodes((positions['x'],positions['y'], node_indices), )
 
 
	connections = data_store.get_analysis_result(identifier='Connections')
	print(connections)
	graph = hv.Graph((([],[],[]), nodes), )

	print(connections)

	for conn in connections:
		print(conn)
		if (conn.source_name == sheet and conn.target_name == sheet):
			graph = connections_inside_layer(conn.weights,nodes)

	#-----

	return graph.relabel(sheet)

    
path_to_data = sys.argv[1]
# for me: /home/katterrina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student
data_store = get_datastore(path_to_data)

graphs = []

for sheet in data_store.sheets():
	g=get_plot(data_store,sheet)
	g.opts(edge_line_width=1, node_size=5)
	g.opts(hv.opts.Graph(inspection_policy='nodes', tools=['hover', 'lasso_select'],
			edge_hover_line_color='green'))
	graphs.append(g)




layout = hv.Layout(graphs).cols(2)
layout.opts(shared_axes=False)

# put the button and plot in a layout and add to the document
#curdoc().add_root(show_graphs(graphs,2))
hv.renderer('bokeh').server_doc(layout)
