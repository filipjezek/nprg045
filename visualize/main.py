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
from bokeh.models import CDSView, ColumnDataSource, GroupFilter
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
	sheet_graph_renderer = sheet_graph(neuron_connections_graph,sheet)
	sheet_graph_renderer.node_renderer.glyph = Circle(fill_color=mapper_nodes,line_color=mapper_nodes)
	sheet_graph_renderer.node_renderer.nonselection_glyph = Circle(fill_color=mapper_nodes,line_color=mapper_nodes)
	nodes_data_source = sheet_graph_renderer.node_renderer.data_source
	nodes_data_source.selected.on_change("indices",
                                    partial(update_renderers_according_selection,
                                            nx_graph=neuron_connections_graph,
                                            edges_in=edges_in))
	 
	sheet_graph_plot = figure(title=sheet,
				  x_range=(-1,1), y_range=(-1,1),
				  tools="lasso_select,pan,wheel_zoom")
	sheet_graph_plot.add_tools(HoverTool(tooltips=[("index", "@index"), ("coordinates", "@coor")]))
	sheet_graph_plot.renderers.append(sheet_graph_renderer)

	plots.append(sheet_graph_plot)
	
layout = gridplot(plots, ncols=2,plot_width=800, plot_height=800)


curdoc().add_root(layout)
