from setuptools import setup

setup(
    name='mozaik_gui_backend',
    packages=['backend'],
    include_package_data=True,
    install_requires=[
        'flask',
    ],
)