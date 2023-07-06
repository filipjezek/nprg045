import itertools as it


def filter_empty(**kwargs):
    a = {key: val for key, val in kwargs.items() if val != None and val != []}
    return a


def batched(iterable, n):
    "Batch data into tuples of length n. The last batch may be shorter."
    # batched('ABCDEFG', 3) --> ABC DEF G
    # https://docs.python.org/3/library/itertools.html
    if n < 1:
        raise ValueError('n must be at least one')
    iterator = iter(iterable)
    while batch := tuple(it.islice(iterator, n)):
        yield batch
