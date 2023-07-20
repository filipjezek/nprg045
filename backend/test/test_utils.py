from backend.utils import filter_empty


def test_filter_empty():
    assert filter_empty(a=1) == {'a': 1}
    assert filter_empty(a=None) == {}
    assert filter_empty(a=[]) == {}
    assert filter_empty(a=[], b=1) == {'b': 1}
    assert filter_empty(a=[1], b=1) == {'a': [1], 'b': 1}
    assert filter_empty(a=[1], b=[1]) == {'a': [1], 'b': [1]}
