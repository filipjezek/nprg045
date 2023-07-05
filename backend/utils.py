def filter_empty(**kwargs):
    a = {key: val for key, val in kwargs.items() if val != None and val != []}
    return a
