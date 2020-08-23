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
from bokeh.models import ColumnDataSource

import holoviews as hv 

from numpy import array, resize, where, arange
from math import ceil

hv.extension('bokeh')
defaults = dict(width=600, height=600)

hv.opts.defaults(
	hv.opts.EdgePaths(**defaults),
	hv.opts.Graph(**defaults),
	hv.opts.Nodes(**defaults)
)

w = [(2.0,3.0,0.1),(2.0,1.0,0.2),(1.0,1.0,0.8),(1.0,3.0,0.1)]

positions = {
	'x' : [1,2,1,3,2],
	'y' : [2,1,3,2,3]
}

# [ expression for item in list if conditional ]

w_source = [int(i) for (i,j,weight) in w]
w_target = [int(j) for (i,j,weight) in w]
edge_labels = [weight for (i,j,weight) in w]

print(w_source)
print(w_target)

node_indices = arange(len(positions['x']))
nodes = hv.Nodes((positions['x'],positions['y'], node_indices), )

simple_graph = hv.Graph(((w_source, w_target),))

graph = hv.Graph(((w_source, w_target, edge_labels), nodes), vdims='weight')

hv.save(graph, 'hv2.html')