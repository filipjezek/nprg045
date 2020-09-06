#!/usr/bin/env python3
import sys

# mozaik
from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters, PyNNDistribution
from mozaik.storage.datastore import Hdf5DataStore,PickledDataStore
from mozaik.analysis.data_structures import Connections
from mozaik.storage import queries

from parameters import UniformDist
from json import JSONEncoder
from parameters import ParameterSet

# visualization
from bokeh.plotting import figure, curdoc, show
from bokeh.layouts import gridplot, layout
from bokeh.models import ToolbarBox, Toolbar, LassoSelectTool, WheelZoomTool,ResetTool, PanTool,HoverTool, Plot
from bokeh.models import ColumnDataSource, GroupFilter, DataRange1d, Hex
from bokeh.palettes import Spectral6
from bokeh.transform import linear_cmap

from numpy import array, resize, where, arange

import networkx as nx

from graph_functions import *

mapper_nodes = linear_cmap(field_name='selected', palette=('#a1cdec', '#440154', '#f20808') ,low=0 ,high=2)
tools = [LassoSelectTool(), ResetTool(), WheelZoomTool(), PanTool(),HoverTool()]

	
path_to_data = sys.argv[1]
# for me: /home/katterrina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student

datastore = get_datastore(path_to_data)
neuron_connections_graph = create_neuron_connections_graph(datastore)
layout = get_nodes_layout(neuron_connections_graph)

edges_in=False

plots=[]

for sheet in datastore.sheets():
    # create graph renderer
	sheet_graph_renderer = sheet_graph(neuron_connections_graph,sheet)
 
	# style nodes
	sheet_graph_renderer.node_renderer.glyph = Hex(fill_color=mapper_nodes,line_color=mapper_nodes)
	sheet_graph_renderer.node_renderer.nonselection_glyph = Hex(fill_color=mapper_nodes,line_color=None)

	# add interactivity to nodes selection
	nodes_data_source = sheet_graph_renderer.node_renderer.data_source
	
	nodes_data_source.selected.on_change("indices",
									partial(update_renderers_according_selection,
											nx_graph=neuron_connections_graph,
											edges_in=edges_in))
	 
	# get plot ranges
	ranges = get_ranges(nodes_data_source.data["coor"])
	# create plot
	sheet_graph_plot = figure(title=sheet,
							  x_range=ranges[0],
    						  y_range=ranges[1],
							  tools="lasso_select,pan,wheel_zoom")
 
	sheet_graph_plot.renderers.append(sheet_graph_renderer)
 
	# does not work
	hover_nodes = HoverTool(
					tooltips=[("index", "@index"), ("coordinates", "@coor")],
					renderers=[sheet_graph_renderer.node_renderer]
					)
	hover_edges = HoverTool(
					tooltips=[('weight','@weight'),('delay','@delay')],
					renderers=[sheet_graph_renderer.edge_renderer]
					)



	sheet_graph_plot.add_tools(hover_edges,hover_nodes)

	plots.append(sheet_graph_plot)
	
layout = gridplot(plots, ncols=2,plot_width=800, plot_height=800)


curdoc().add_root(layout)
