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
from bokeh.layouts import gridplot
from bokeh.models import ColumnDataSource, LassoSelectTool

import holoviews as hv 
import datashader as ds

from holoviews.operation.datashader import datashade, shade, dynspread, rasterize, bundle_graph

from numpy import array, resize, where, arange
from math import ceil

def prepare_plots_grid(plots, plots_per_line):
	"""
	Prepare grid list from list of plots.
	"""
	# maybe? (not very elegant)

	height = ceil(len(plots) / plots_per_line)

	grid = array(plots)
	grid.resize(height,plots_per_line)

	grid = where(grid==0, None, grid)

	result = grid.tolist()

	return result

def show_sheets_plots(plots_dict, plots_per_line):
	"""
	Shows plot for each sheet in a grid.
	plots_dict: dictionary, structure 'sheet':plot
	"""

	grid_to_show = prepare_plots_grid(list(plots_dict.values()), plots_per_line)

	grid = gridplot(grid_to_show, sizing_mode ="scale_width")
	show(grid)

def show_graphs(graphs_dict,cols_number):
	"""
	Shows plot for each sheet in a grid.
	plots_dict: dictionary, structure 'sheet':plot
	"""

	hv.extension('bokeh')

	defaults = dict(width=600, height=600)
 
	hv.opts.defaults(
    	hv.opts.EdgePaths(**defaults),
    	hv.opts.Graph(**defaults),
    	hv.opts.Nodes(**defaults)
    )

	graphs_list = []

	for g in graphs_dict:
		graph = graphs_dict[g]

		graph.opts(edge_line_width=1, node_size=5)
		#graph.opts(min_width=1) #datashade
		#if type(graph) == hv.element.graphs.Graph:
		#	print(type(graph))
		#	graph.nodes.opts(size=5)

		graph.opts(hv.opts.Graph(inspection_policy='nodes', tools=['hover', 'lasso_select'],
			edge_hover_line_color='green'))

		graphs_list.append(graph)

	layout = hv.Layout(graphs_list)
	layout.cols(cols_number)
	layout.opts(shared_axes=False)
 
	bokeh_layout = hv.render(layout)

	show(bokeh_layout)

def connections_inside_layer_bundle(connections,nodes):
	c_source = [int(i) for (i,j,weight) in connections]
	c_target = [int(j) for (i,j,weight) in connections]
	edge_labels = [x for (i,j,x) in connections]
	g = hv.Graph(((c_source, c_target, edge_labels), nodes), vdims='weight')
	print("before B") # test
	bg = bundle_graph(g)
	print("after B")
	return bg
	#return g # without bundle

def connections_inside_layer_datashade(connections,nodes):
	c_source = [int(i) for (i,j,weight) in connections]
	c_target = [int(j) for (i,j,weight) in connections]
	edge_labels = [x for (i,j,x) in connections]

	graph = datashade(hv.Graph(((c_source, c_target,edge_labels),nodes)))
 
	return graph

def get_plot(data_store, sheet):
	"""
	Returns plot for the sheet.
	"""

	positions = {
		'x' : data_store.get_neuron_positions()[sheet][0],
		'y' : data_store.get_neuron_positions()[sheet][1]
	}

	#-----
	connections = data_store.get_analysis_result(identifier='Connections')

	node_indices = arange(len(positions['x']))
	nodes = hv.Nodes((positions['x'],positions['y'], node_indices), )
 
	graph = hv.Graph((([],[],[]), nodes), )

	for conn in connections:
		if (conn.source_name == sheet and conn.target_name == sheet):
			graph = connections_inside_layer_bundle(conn.weights,nodes)
			

	#-----

	return graph.relabel(sheet)


def __main__():

	# todo ------
	data_store = PickledDataStore(load=True, parameters=ParameterSet({'root_directory': '/home/katterrina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student' ,'store_stimuli' : False}), replace=False)
	output_file("testOutput.html")
	#------------

	graphs = {}


	for sheet in data_store.sheets():
		graphs[sheet] = get_plot(data_store,sheet)

	show_graphs(graphs,2)

if __name__ == "__main__":
    __main__()
