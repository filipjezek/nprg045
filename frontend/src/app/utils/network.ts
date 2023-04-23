import { Connection, NetworkNode } from '../store/reducers/model.reducer';

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
  if (selected.size == 0) return [];
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
