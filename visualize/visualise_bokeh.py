from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters, PyNNDistribution
from mozaik.storage.datastore import Hdf5DataStore,PickledDataStore
from mozaik.analysis.data_structures import Connections
from mozaik.storage import queries

from parameters import UniformDist # right? (source: https://pythonhosted.org/NeuroTools/parameters.html)
from json import JSONEncoder # right? (source: https://docs.python.org/3/library/json.html#module-json)
from parameters import ParameterSet

from bokeh.plotting import figure, output_file, show
from bokeh.layouts import layout

from numpy import array, reshape

def show_sheets_plots(plots):

	# todo better layout, this is only for testing
	height = (int)(plots.__len__() / 2) 
	graphs_grid = array(list(plots.values()))
	graphs_grid = reshape(graphs_grid,(height,2)).tolist()

	grid = layout(graphs_grid, sizing_mode = "scale_width")
	show(grid)


def __main__():
	data_store = PickledDataStore(load=True, parameters=ParameterSet({'root_directory': '/home/katerina/matfyz/rocnikac/vzorove_mozaik/FeedForwardInhibition_student' ,'store_stimuli' : False}), replace=False)

	output_file("testOutput.html") # todo

	graphs = {}

	for sheet in data_store.sheets():
		dsv = queries.param_filter_query(data_store, sheet_name=sheet)
		positions = dsv.get_neuron_positions()
		graphs[sheet] = figure(title=sheet, x_axis_label='x', y_axis_label='y')

	show_sheets_plots(graphs)

if __name__ == "__main__":
    __main__()
