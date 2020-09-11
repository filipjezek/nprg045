#!/usr/bin/env python3
import sys

from bokeh.plotting import curdoc
from bokeh.models import GraphRenderer,Div,Range1d

import networkx as nx
from functools import partial

from .graph import *

def update_renderers_after_selection(event,nx_graph,this_renderer,this_sheet,sheets,edges_in_toggle):
	"""
	update all graph renderers if selection event is comleted
	nx_graph: networkx neuron connnections graph
	this_renderer: graph renderer of this selection
	this_sheet: string name of this sheet (name of this_renderer)
	sheets: list of all sheets names
	edges_in_toggle.active: if True, show edges pointing inwards
	"""
	if event.final:
		edges_in = edges_in_toggle.active
		update_nodes_and_edges_data(nx_graph,this_renderer,this_sheet,sheets,edges_in)


def selected_nx_index(graph_renderer,new_data_nodes):
	"""
	return indicies (index attribute, not position) of nodes selected in current graph_renderer
	and change their state in new_data_nodes list
	new_data_nodes: list of int, 1 if node is selected, 2 if it is neighbor of selected, 0 otherwise
	"""
	selected_indicies = []

	source = graph_renderer.node_renderer.data_source
	indicies_in_renderer = source.selected.indices

	for i in indicies_in_renderer:	
		node_index = source.data['index'][i]
		selected_indicies.append(node_index)
		new_data_nodes[i] = 1

	return selected_indicies

def update_nodes_and_edges_data(nx_graph,graph_renderer,this_sheet,sheets,edges_in):
	"""
	update 'selected' column in all renderers nodes data source
	and provide new edges data to all renderers edges data source
	nx_graph: networkx neuron connnections graph
	this_renderer: graph renderer of this selection
	sheets: list of all sheets names
	edges_in: if True, show edges pointing inwards
	"""

	# prepare data sources
	nodes_data_source = graph_renderer.node_renderer.data_source
	edges_data_source = graph_renderer.edge_renderer.data_source

	# reset if nodes are selected
	new_data_nodes = [0] * len(nodes_data_source.data['selected'])

	# get indicies of of selected nodes
	selected_nx_indicies = selected_nx_index(graph_renderer,new_data_nodes)

	# if selected only one node, display info about connections
	textarea = curdoc().select({'name':'conn_info'})[0]
	if len(selected_nx_indicies)==1:
		textarea.text = text_info_about_connections(nx_graph,selected_nx_indicies[0],edges_in)
	else:
		textarea.text = ""

	# prepare empty edges data
	edges = {'start':[], 'end':[], 'weight':[],'delay':[]}
 
	neighbors_in_other_sheets = { s:[] for s in sheets }

	for node in selected_nx_indicies:

		# get neighbors of selected node
		neighbors = get_neighbors(node,nx_graph, edges_in)

		for ng in neighbors:

			# for neighbor in this sheet change their 'selected' value and add edge
			if nx_graph.nodes[ng]['sheet'] == this_sheet:
				p = nodes_data_source.data['index'].index(ng)
				if new_data_nodes[p] == 0:
					new_data_nodes[p] = 2

				if edges_in:
					append_edge_to_edges_dict(edges,nx_graph,ng,node)
				else:
					append_edge_to_edges_dict(edges,nx_graph,node,ng)

			# nodes in other sheets add to neighbors_in_other_sheets dict
			else:
				neighbors_in_other_sheets[nx_graph.nodes[ng]['sheet']].append(ng)

	# update data
	nodes_data_source.data['selected'] = new_data_nodes
	edges_data_source.data = edges

	# update data ('selected' value) in other sheets
	update_neighbors_in_other_sheets(neighbors_in_other_sheets,this_sheet)

def update_neighbors_in_other_sheets(neighbors_dict,active_sheet):
	"""
	foreach sheet (graph renderer) update 'selected' nodes info
	"""

	for graph_renderer in curdoc().select({'type':GraphRenderer}):

		if graph_renderer.name == active_sheet:
			continue # action source sheet is updated yet

		nodes_data_source = graph_renderer.node_renderer.data_source
		new_data_nodes = [0] * len(nodes_data_source.data['selected'])

		for node in neighbors_dict[graph_renderer.name]:
			p = nodes_data_source.data['index'].index(node)
			new_data_nodes[p] = 2 

		nodes_data_source.data['selected'] = new_data_nodes

		# reset edges data
		edges_data_source = graph_renderer.edge_renderer.data_source
		edges_data_source.data = {'start':[], 'end':[], 'weight':[],'delay':[]}

def append_edge_to_edges_dict(edges_dict, nx_graph, start, end):
	"""
	append netwotkx graph edge (start,end) to bokeh CDS edges dictionary
	"""
	edges_dict['start'].append(start)
	edges_dict['end'].append(end)
	edges_dict['weight'].append(nx_graph.edges[(start,end)]['weight'])
	edges_dict['delay'].append(nx_graph.edges[(start,end)]['delay'])

def get_ranges(coors_list):
	"""
	find ranges from list of coordinates [(x,y)]
	"""
	min_x = -0.1
	max_x = 0.1
	min_y = -0.1
	max_y = 0.1
 
	for coor in coors_list:
		x = coor[0]
		y = coor[1]
		if x<min_x:
			min_x = x
		if x>max_x:
			max_x=x
		if y<min_y:
			min_y=y
		if y>max_y:
			max_y=y

	return (Range1d(min_x,max_x),Range1d(min_y,max_y))

def reset_visualization(source):
	"""
	unselect all
	"""
	for graph_renderer in curdoc().select({'type':GraphRenderer}):
		# reset edges 'selected' value
		nodes = [0] * len(graph_renderer.node_renderer.data_source.data['selected'])
		graph_renderer.node_renderer.data_source.data['selected'] = nodes
		# empty edges
		graph_renderer.edge_renderer.data_source.data = {'start':[], 'end':[], 'weight':[],'delay':[]}

	# reset connection info text
	(curdoc().select({'name':'conn_info'})[0]).text = ""

def text_info_about_connections(nx_graph, node_index, edges_in):
	"""
	display info about node connections as HTML
	nx_graph: networkx neuron connnections graph
	node_index: index of the node in nx_graph
	edges_in: if True, show info about edges pointing inwards	
	"""
		
	selected_node = '<h3>Selected node {index}</h3>'.format(index=node_index)
 
	selected_node_info = "Sheet: {sheet}<br>Coordinates: ({x:.2f},{y:.2f})".format(
		sheet=nx_graph.nodes[node_index]['sheet'],
		x=nx_graph.nodes[node_index]['coor'][0],
		y=nx_graph.nodes[node_index]['coor'][1]
	)

	d = ""
	if edges_in:
		d = "Incoming"
	else:
		d = "Outcoming"

	connections_headline = "<h2>{direction} connections:</h2>".format(direction=d)
 
	connections = ""

	neighbors = get_neighbors(node_index,nx_graph, edges_in)
 
	for n in neighbors:
		nx_graph.nodes[n]['sheet']

		neighbor_info = "<h4>{node}, {sheet}, coor: ({x:.2f},{y:.2f})</h4>".format(
			node=int(n),
			sheet=nx_graph.nodes[n]['sheet'],
			x=nx_graph.nodes[n]['coor'][0],
			y=nx_graph.nodes[n]['coor'][1]
			)

		if edges_in:
			start = n
			end = node_index
		else:
			start = node_index
			end = n     

		connection_info = "<ul><li>weight: {w}</li><li>delay: {d}</li></ul>".format(
			w = nx_graph.edges[(start,end)]['weight'],
			d = nx_graph.edges[(start,end)]['delay']
		)
  
		connections += neighbor_info+connection_info

	text='<div style="width:300px;height:1000px;margin:10px;overflow-y:auto;overflow-x: hidden">' 
	text+= selected_node + selected_node_info + connections_headline + connections + '</div>'

	return text