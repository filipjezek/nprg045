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

# bokeh plotting
from bokeh.plotting import figure, curdoc
from bokeh.layouts import gridplot
from bokeh.models import Hex
from bokeh.transform import linear_cmap

from graph_functions import *

mapper_nodes = linear_cmap(field_name='selected', palette=('#a1cdec', '#440154', '#f20808') ,low=0 ,high=2)

path_to_data = sys.argv[1]
# for me: /home/katterrina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student

datastore = get_datastore(path_to_data)
neuron_connections_graph = create_neuron_connections_graph(datastore)

edges_in=False

sheets = datastore.sheets()
plots=[]

for sheet in sheets:
    # create graph renderer
	sheet_graph_renderer = sheet_graph(neuron_connections_graph,sheet)
	sheet_graph_renderer.name = sheet
 
	# style nodes
	sheet_graph_renderer.node_renderer.glyph = Hex(fill_color=mapper_nodes,line_color=mapper_nodes)
	sheet_graph_renderer.node_renderer.nonselection_glyph = Hex(fill_color=mapper_nodes,line_color=None)

	# add interactivity to nodes selection
	nodes_data_source = sheet_graph_renderer.node_renderer.data_source	
	nodes_data_source.selected.on_change("indices",
									partial(update_renderers_according_selection,
											nx_graph=neuron_connections_graph,
											#this_renderer=sheet_graph_renderer,
											edges_in=edges_in))
	 
	# get plot ranges
	ranges = get_ranges(nodes_data_source.data["coor"])

	# create plot
	sheet_graph_plot = figure(title=sheet,
							  x_range=ranges[0],
    						  y_range=ranges[1],
							  tools="lasso_select,pan,wheel_zoom")

	# add renderer to the plot
	sheet_graph_plot.renderers.append(sheet_graph_renderer)
 
	# works only for one of them, not both
	hover_nodes = HoverTool(
					tooltips=[("index", "@index"), ("coordinates", "@coor")],
					renderers=[sheet_graph_renderer.node_renderer]
					)
	hover_edges = HoverTool(
					tooltips=[('weight','@weight'),('delay','@delay')],
					renderers=[sheet_graph_renderer.edge_renderer]
					)
	sheet_graph_plot.add_tools(hover_edges,hover_nodes)
 
	# add completed plot to plots list
	plots.append(sheet_graph_plot)

# create grid layout form plots list
layout = gridplot(plots, ncols=2,plot_width=800, plot_height=800)

curdoc().add_root(layout)
