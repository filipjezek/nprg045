# Visualization tool for mozaik

Example session:
![example](example.png)

- [documentation](dokumentace.pdf) (in czech)

## How to run visualization

- install mozaik ([](https://github.com/antolikjan/mozaik)):
- install node.js
- run in folder mff_nprg045 (flask server):

```bash
pip install -e .
export FLASK_APP=backend
flask run
```

- run in folder mff_nprg045/frontend (angular development server):

```bash
npm i -g @angular/cli
npm i
ng serve
```

## Usage

- [](http://localhost:4200/model)
- click any neuron to reveal all connections
- selecting more is possible with `shift` key
- lasso is also available when dragging with `shift` key
- hover on any node or connection to display tooltip with more info
