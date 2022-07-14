import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from '../services/http.service';
import { ModelNetwork } from '../store/reducers/model.reducer';

export interface Model {
  sheets: Sheet[];
  neurons: Neuron[];
  connections: Connections[];
}

export interface Connections {
  edges: Edge[];
  src: string; // sheet
  target: string; // sheet
}

export interface Edge {
  srcIndex: number;
  tgtIndex: number;
  weight: number;
  delay: number;
}
export interface Sheet {
  label: string;
  neuronPositions: {
    ids: number[];
    x: number[];
    y: number[];
  };
}

export interface Neuron {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  constructor(private http: HttpService) {}

  public loadModel(path: string): Observable<{ model: ModelNetwork }> {
    return this.http
      .get<Model>('model', new HttpParams().append('path', path))
      .pipe(map((m) => ({ model: this.parseNetwork(m) })));
  }

  private parseNetwork(model: Model): ModelNetwork {
    const network: ModelNetwork = {
      nodes: [],
      sheetNodes: {},
    };
    for (const { id } of model.neurons) {
      network.nodes[id] = { id, sheets: {} };
    }

    const sheetMap = new Map<string, Sheet>();
    for (const sheet of model.sheets) {
      sheetMap.set(sheet.label, sheet);
      network.sheetNodes[sheet.label] = [];

      sheet.neuronPositions.ids.forEach((id, i) => {
        network.nodes[id].sheets[sheet.label] = {
          x: sheet.neuronPositions.x[i],
          y: sheet.neuronPositions.y[i],
          connections: [],
        };
        network.sheetNodes[sheet.label].push(network.nodes[id]);
      });
    }

    for (const { src, target, edges } of model.connections) {
      for (const edge of edges) {
        const srcNode =
          network.nodes[sheetMap.get(src).neuronPositions.ids[edge.srcIndex]];
        const tgtNode =
          network.nodes[
            sheetMap.get(target).neuronPositions.ids[edge.tgtIndex]
          ];
        srcNode.sheets[src].connections.push({
          sheet: target,
          node: tgtNode.id,
          delay: edge.delay,
          weight: edge.weight,
        });
      }
    }
    return network;
  }
}
