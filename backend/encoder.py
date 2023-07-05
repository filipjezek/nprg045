import flask
import math
import quantities as pq
import numpy as np


class JSONEncoder(flask.json.provider.DefaultJSONProvider):

    def default(self, obj):
        if isinstance(obj, pq.Quantity):
            if obj is pq.unitquantity.Dimensionless:
                return ''
            return obj.dimensionality.unicode
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if math.isnan(obj):
            return None

        # Let the base class default method raise the TypeError
        return flask.json.provider.DefaultJSONProvider.default(obj)
