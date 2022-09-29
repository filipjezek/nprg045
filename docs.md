# Developer documentation

## Technology

- server is implemented in Flask (Python)
- frontend is implemented in Angular (Typescript)
  - visualisation: D3.js
  - state management: NGRX

## Server side

The Flask server is mostly just a proxy between frontend and the mozaik datastore. Its main function is discovery of datastores (`backend/filesystem.py`) and converting mozaik classes to JSON-encodable TypedDicts (`backend/model.py`, `backend/ads.py`).

## Frontend

This is where all the interesting work happens. The web is a SPA. After the web fetches filesystem information from Flask, it first checks if any datastore is already selected. If not, the user cannot proceed until he selects one. (`/frontend/src/app/common/header/header.component.ts`)

### URI

The visualisation selection is stored in URI.

Example:

```plain
http://localhost:4200/datastore/source%2Fmozaik%2Ftests%2Ftools%2Freference_data%2FToMerge3/model/pnv/5?stimulus=0&valueName=Tria-to-trial%20Var%20of%20Firing%20rate
```

This translates as follows:

- datastore: source/mozaik/tests/tools/reference_data/ToMerge3
- visualisation type: model with PerNeuronValue
- selected AnalysisDataStructure: 6th (6th from all ADSs, not just from PNVs)
- stimulus: first
- valueName: Tria-to-trial Var of Firing rate

(Visualisation type and ADS selection is handled in `/frontend/src/app/common/features/features.component.ts`, additional parameters (such as stimulus) are added using `/frontend/src/app/widgets/category-list/category-list.component.ts`)

### Model page

This page is responsible for both basic model visualisation (nodes and their connections) and visualisations which reuse the basic model graph (for now, that is PerNeuronValue). The page component holds data about selected nodes (and possibly PNV filters), which are shared among its children (meaning NetworkGraph and SelectedData, possibly Scale). The page component also processes URI data and selects the relevant data to display from Store.

#### NetworkGraph

Handles displaying nodes on canvas, user interaction (zooming, translating, tooltips, selection etc)

#### SelectedData

Is mostly just a list of information about selected nodes. Also supports selecting additional nodes from here. Hovering a node updates the HoveredNodes selection in ModelPage, which relays the change to NetworkGraph instances (this works both ways).

#### ModelService

Transforms the data received from Flask to a more suitable form. This form is quite large, so this transformation happens after sending the data through network and not on server. Also, although it might make sense to use circular references, this breaks debugging tools (Redux Devtools).

### State

State is handled in NGRX Store. The three most notable substates are `fs` (datastores discovery), `model` (nodes and connections) and `ads` (ADSs in the current datastore).
