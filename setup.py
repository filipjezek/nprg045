#!/usr/bin/env python3

from setuptools import setup

def get_readme():
    """Return content of README file."""
    with open('README') as readme_file:
        return readme_file.read()

setup(
    name='matfyz-nswi177-MySSG-cizkovk5',
    version='0.1',
    description='My SSG',
    long_description=get_readme(),
    classifiers=[
        'Programming Language :: Python :: 3.7',
    ],
    install_requires=[
        'Jinja2',
        'Markdown',
        'PyYAML==5.3.1'
    ],
    include_package_data=True,
    zip_safe=False,
    packages=[
        'matfyz.nswi177'
    ],
    entry_points={
        'console_scripts': [
            'my_ssg=matfyz.nswi177.my_ssg',
        ],
    },
)
