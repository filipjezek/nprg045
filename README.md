# Visualization tool for mozaik

Example session:
![example](example.png)

- [developer documentation](docs.md)

## How to run visualization

- install mozaik (<https://github.com/antolikjan/mozaik>):
- install [node.js](https://nodejs.org/en/)

### Dependencies

```bash
pip install -e .
npm i -g @angular/cli
cd frontend
npm i
```

### Production build & run

```bash
cd frontend
npm run build
cd ..
./run.sh
```

- open <http://localhost:5000>

### Angular development server

_Angular dev server is only intended for development_

```bash
cd frontend
ng serve
```

- frontend will not be served by flask but by angular
- url defaults to <http://localhost:4200>
- flask server needs to be running too to provide backend api

## Usage

- open the app in browser
- select datastore to examine
- click any neuron to reveal all connections
  - selecting more is possible with `shift` key
  - lasso is also available when dragging with `shift` key
  - hover on any node or connection to display tooltip with more info
  - hovering and selection also works in the info sidebar
- click any analysis data structure in the top listing to load it
  - currently supports only PerNeuronValue

## Notes

Datastore selection is constrained to a specific directory. By default, it is the root project directory. This can be changed using the `--root` arg:

```bash
./run.sh --root /my/path
```
