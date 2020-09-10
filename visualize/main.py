#!/usr/bin/env python3
import sys

# bokeh plotting
from bokeh.plotting import figure, curdoc
from bokeh.layouts import gridplot, row, column
from bokeh.models import Hex, RadioButtonGroup, Button, Div, HoverTool
from bokeh.transform import linear_cmap
from bokeh.events import SelectionGeometry

from .graph import *
from .interactivity import *

mapper_nodes = linear_cmap(field_name='selected',
                           palette=('#8cbacc', '#f0e60c', '#ff000d'),low=0 ,high=2)
mapper_nodes_line = linear_cmap(field_name='selected',
                                palette=('#337088', '#d8cf0a', '#990007'),low=0 ,high=2)


path_to_data = sys.argv[1]

datastore = get_datastore(path_to_data)
neuron_connections_graph = create_neuron_connections_graph(datastore)

# buttons to choose if displayed edges are outcoming or incoming
radio_button_group = RadioButtonGroup(labels=["outcoming edges", "incoming edges"], active=0)
radio_button_group.on_click(reset_visualization)

# reset button
reset_button = Button(label="reset")
reset_button.on_click(reset_visualization)

# helptext to conn info
text = '<div style="width:200px;margin:10px">Select one node to show info about its connections.</div>'
helptext = Div(text=text)
# area to add text info about connections from/to selected node
conn_info = Div(text="")
conn_info.name = "conn_info"

# get sheets from datastore
sheets = datastore.sheets()

plots=[]

for sheet in sheets:
	# create graph renderer
	sheet_graph_renderer = create_sheet_graph_renderer(neuron_connections_graph,sheet)
	sheet_graph_renderer.name = sheet
 
	# style nodes
	node_style = Hex(size=6,fill_color=mapper_nodes,line_color=mapper_nodes_line)
	sheet_graph_renderer.node_renderer.glyph = node_style
	sheet_graph_renderer.node_renderer.nonselection_glyph = node_style
 
	# add interactivity to nodes selection
	nodes_data_source = sheet_graph_renderer.node_renderer.data_source	

	# get plot ranges
	ranges = get_ranges(nodes_data_source.data["coor"])

	# create plot
	sheet_graph_plot = figure(title=sheet,
							  x_range=ranges[0],
							  y_range=ranges[1],
							  tools="lasso_select,pan,wheel_zoom,tap")

	# add renderer to the plot
	sheet_graph_plot.renderers.append(sheet_graph_renderer)
 
	# hover tool
	hover_nodes = HoverTool(tooltips=[("index", "@index"), ("coordinates", "@coor")])
 
	sheet_graph_plot.tools.append(hover_nodes)

	# interactivity after selection
	sheet_graph_plot.on_event(SelectionGeometry,
								partial(update_renderers_after_selection,
											nx_graph=neuron_connections_graph,
											this_sheet=sheet,
											sheets=sheets,
											edges_in_rbgroup=radio_button_group))
 
	# add completed plot to plots list
	plots.append(sheet_graph_plot)

# create grid layout form plots list
layout = gridplot(plots, ncols=2,plot_width=800, plot_height=800)

curdoc().add_root(row(reset_button,radio_button_group))
curdoc().add_root(row(layout,column(helptext,conn_info)))




