from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters, PyNNDistribution
from mozaik.storage.datastore import Hdf5DataStore,PickledDataStore
from mozaik.analysis.data_structures import Connections
from mozaik.storage import queries

from parameters import UniformDist # right? (source: https://pythonhosted.org/NeuroTools/parameters.html)
from json import JSONEncoder # right? (source: https://docs.python.org/3/library/json.html#module-json)
from parameters import ParameterSet

from bokeh.plotting import figure, output_file, show
from bokeh.layouts import layout, gridplot
from bokeh.models import ColumnDataSource

from numpy import array, reshape, resize, where
from math import ceil

def show_sheets_plots(plots, plots_per_line):
	"""
	Shows plot for each sheet in a grid.
	plots: dictionary, structure 'sheet':plot
	"""

	height = ceil(plots.__len__() / plots_per_line) 
	graphs_grid = array(list(plots.values()))
	graphs_grid.resize((height,plots_per_line))
	graphs_grid = where(graphs_grid==0, None, graphs_grid) 

	grid_to_show = graphs_grid.tolist()

	grid = gridplot(grid_to_show, sizing_mode ="scale_width")
	show(grid)

def get_plot(data_store, sheet):
	"""
	Returns plot for the sheet.
	"""

	positions = {
		'x' : data_store.get_neuron_positions()[sheet][0],
		'y' : data_store.get_neuron_positions()[sheet][1]
	}

	plotting_data = ColumnDataSource(data=positions)

	plot = figure(title=sheet)
	plot.circle(x='x',y='y',source=plotting_data)

	return plot


def __main__():
	data_store = PickledDataStore(load=True, parameters=ParameterSet({'root_directory': '/home/katerina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student' ,'store_stimuli' : False}), replace=False)

	output_file("testOutput.html") # todo

	graphs = {}

	for sheet in data_store.sheets():
		graphs[sheet] = get_plot(data_store,sheet)

	show_sheets_plots(graphs,2)

if __name__ == "__main__":
    __main__()
