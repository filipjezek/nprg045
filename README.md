# Visualization tool for mozaik

Example session:
![example](example.png)

## How to run visualization

- install python (at least 3.10)
- install mozaik (<https://github.com/antolikjan/mozaik>):
- install [node.js](https://nodejs.org/en/)

### Dependencies

```bash
pip install -r requirements.txt
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
- filter ADS using SQL or filter dialogs
- view selected ADS in tabs in the inspector view
- multiple tabs can be selected at once using the shift key
- shift key can also be used to select multiple neurons or draw a lasso in a network graph

## Documentation

Please refer to the accompanying [thesis](thesis.pdf) (in czech, but with pictures)

## Notes

Datastore selection is constrained to a specific directory. By default, it is the root project directory. This can be changed using the `--root` arg:

```
Usage: ./run.sh [options]

Options:
   --expose
      listen on all network interfaces (default false)
   -h, --help
      display this message
   --port
      port to listen on (default 5000)
   --prod
      use production parameters (default false)
   --restart
      restart on crash (default false)
   --root
      root folder for looking up datastores, can be specified multiple times (default .)
```
