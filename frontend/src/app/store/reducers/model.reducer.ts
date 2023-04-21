import { createReducer, on } from '@ngrx/store';
import {
  addSelectedNodes,
  connectionsLoadingProgress,
  hoverNode,
  loadModel,
  metadataLoaded,
  modelLoaded,
  positionsLoadingProgress,
  selectNodes,
} from '../actions/model.actions';
import { unionBy } from 'lodash-es';

export const modelFeatureKey = 'model';

// one large network containing all nodes and connections.
// connections and nodes can be viewed differently based on sheet parameter
export interface ModelNetwork {
  nodes: NetworkNode[]; // indexed by id

  // duplicate reference for convenience
  sheetNodes: {
    [key: string]: NetworkNode[];
  };
}
export interface NetworkNode {
  id: number; // this is for convenience
  sheets: {
    [key: string]: {
      x: number;
      y: number;
      connections: {
        sheet: string;
        node: number; // id - ngrx devtools crash otherwise bc they can't handle circular refs
        weight: number;
        delay: number;
      }[];
    };
  };
}

export interface Connection {
  weight: number;
  delay: number;
  from: number;
  to: number;
}

export interface NetworkMetadata {
  connections: {
    from: string;
    to: string;
    size: number;
  }[];
  positions: {
    sheet: string;
    size: number;
  }[];
}
export interface NetworkProgress {
  connections: {
    from: string;
    to: string;
    size: number;
    current: number;
  }[];
  positions: {
    sheet: string;
    size: number;
    current: number;
  }[];
}

export interface State {
  currentModel: ModelNetwork;
  loading: NetworkProgress;
  selected: NetworkNode[];
  hovered: NetworkNode;
}

export const initialState: State = {
  currentModel: null,
  loading: null,
  selected: [],
  hovered: null,
};

export const reducer = createReducer(
  initialState,
  on(loadModel, (state) => ({
    ...state,
    currentModel: null,
    selected: [],
    hovered: null,
  })),
  on(modelLoaded, (state, { model }) => ({
    ...state,
    currentModel: { ...model },
    loading: null,
  })),
  on(metadataLoaded, (state, { meta }) => ({
    ...state,
    loading: {
      connections: meta.connections.map((conn) => ({ ...conn, current: 0 })),
      positions: meta.positions.map((pos) => ({ ...pos, current: 0 })),
    },
  })),
  on(connectionsLoadingProgress, (state, { src, tgt, current }) => ({
    ...state,
    loading: state.loading && {
      ...state.loading,
      connections: state.loading.connections.map((conn) =>
        conn.from == src && conn.to == tgt ? { ...conn, current } : conn
      ),
    },
  })),
  on(positionsLoadingProgress, (state, { sheet, current }) => ({
    ...state,
    loading: state.loading && {
      ...state.loading,
      positions: state.loading.positions.map((pos) =>
        pos.sheet == sheet ? { ...pos, current } : pos
      ),
    },
  })),
  on(hoverNode, (state, { node }) => ({
    ...state,
    hovered: typeof node == 'number' ? state.currentModel.nodes[node] : node,
  })),
  on(selectNodes, (state, { nodes }) => {
    const normalized =
      nodes.length > 0 && typeof nodes[0] == 'number'
        ? (nodes as number[]).map((n) => state.currentModel.nodes[n])
        : (nodes as NetworkNode[]);
    if (
      nodes.length == 1 &&
      state.selected.some((n) => n.id == normalized[0].id)
    ) {
      return { ...state, selected: [] };
    }
    return { ...state, selected: normalized };
  }),
  on(addSelectedNodes, (state, { nodes }) => {
    const normalized =
      nodes.length > 0 && typeof nodes[0] == 'number'
        ? (nodes as number[]).map((n) => state.currentModel.nodes[n])
        : (nodes as NetworkNode[]);
    if (
      nodes.length == 1 &&
      state.selected.some((n) => n.id == normalized[0].id)
    ) {
      return {
        ...state,
        selected: state.selected.filter((n) => n.id != normalized[0].id),
      };
    }
    return {
      ...state,
      selected: unionBy(state.selected, normalized, (n) => n.id),
    };
  })
);
