import { createReducer, on } from '@ngrx/store';
import { modelLoaded } from '../actions/model.actions';
import * as fromRoot from './index';

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

export function getOutgoingConnections(
  selected: NetworkNode[],
  sheet: string
): Connection[] {
  return selected.flatMap(
    (n) =>
      n.sheets[sheet]?.connections
        .filter((conn) => conn.sheet === sheet)
        .map((conn) => ({
          weight: conn.weight,
          delay: conn.delay,
          from: n.id,
          to: conn.node,
        })) || []
  );
}
export function getIncomingConnections(
  selected: Set<number>,
  sheet: string,
  all: NetworkNode[]
): Connection[] {
  return all.flatMap(
    (n) =>
      n.sheets[sheet]?.connections
        .filter((conn) => conn.sheet === sheet && selected.has(conn.node))
        .map((conn) => ({
          weight: conn.weight,
          delay: conn.delay,
          from: n.id,
          to: conn.node,
        })) || []
  );
}
export function getAllIncomingConnections(
  node: NetworkNode,
  all: NetworkNode[]
): Record<string, Connection[]> {
  const res: Record<string, Connection[]> = {};
  all.forEach((n) => {
    for (const sheet in n.sheets) {
      if (!(sheet in res)) res[sheet] = [];
      n.sheets[sheet].connections
        .filter((conn) => conn.node === node.id)
        .forEach((conn) => {
          res[sheet].push({
            weight: conn.weight,
            delay: conn.delay,
            from: n.id,
            to: conn.node,
          });
        });
    }
  });
  for (const sheet in res) {
    if (!res[sheet].length) delete res[sheet];
  }
  return res;
}

export interface ModelState {
  currentModel?: ModelNetwork;
}

export interface State extends fromRoot.State {
  [modelFeatureKey]: ModelState;
}

export const initialState: ModelState = {
  currentModel: null,
};

export const reducer = createReducer(
  initialState,
  on(modelLoaded, (state, { model }) => ({
    ...state,
    currentModel: { ...model },
  }))
);
