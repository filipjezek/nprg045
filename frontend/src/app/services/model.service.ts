import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  concat,
  concatWith,
  from,
  last,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { HttpService } from './http.service';
import { ModelNetwork } from '../store/reducers/model.reducer';
import * as csv from 'csv/browser/esm';

export interface Model {
  sheets: Sheet[];
  connections: Connections[];
}

export interface Connections {
  src: string; // sheet
  target: string; // sheet
  size: number;
}

export interface Sheet {
  label: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  constructor(private http: HttpService) {}

  public loadModel(path: string): Observable<ModelNetwork> {
    const pathParam = new HttpParams().append('path', path);
    return this.http.get<Model>('model', pathParam).pipe(
      switchMap((m) => {
        const network = this.prepareSkeleton(m);
        return this.addPositions(network, m, pathParam).pipe(
          concatWith(this.addConnections(network, m, pathParam))
        );
      }),
      last()
    );
  }

  private prepareSkeleton(model: Model): ModelNetwork {
    const network: ModelNetwork = {
      nodes: [],
      sheetNodes: {},
    };
    for (const sheet of model.sheets) {
      network.sheetNodes[sheet.label] = [];
    }
    return network;
  }

  private parseCSV<T extends Record<string, any>>(
    columns: (keyof T)[]
  ): (src: Observable<string>) => Observable<T> {
    return (source: Observable<string>) => {
      return new Observable<T>((subscriber) => {
        const parser = csv.parse({ cast: true, columns: columns as string[] });
        const srcSubscr = source.subscribe({
          next(value) {
            parser.write(value);
          },
          error(error) {
            subscriber.error(error);
          },
          complete() {
            parser.end();
          },
        });

        parser.on('readable', () => {
          let record: T;
          while ((record = parser.read()) !== null) {
            subscriber.next(record);
          }
        });
        parser.on('error', (error) => {
          subscriber.error(error);
        });
        parser.on('end', () => {
          subscriber.complete();
        });

        return () => {
          srcSubscr.unsubscribe();
          parser.end();
        };
      });
    };
  }

  private addPositions(
    network: ModelNetwork,
    m: Model,
    pathParam: HttpParams
  ): Observable<ModelNetwork> {
    return concat(
      ...m.sheets.map(({ label }) =>
        this.http
          .consumeStream('model/positions', {
            params: pathParam.append('sheet', label),
            method: 'GET',
          })
          .pipe(
            this.parseCSV<{ id: number; x: number; y: number }>([
              'id',
              'x',
              'y',
            ]),
            map(({ id, x, y }) => {
              if (!network.nodes[id]) {
                network.nodes[id] = { id, sheets: {} };
              }

              network.nodes[id].sheets[label] = {
                x,
                y,
                connections: [],
              };
              network.sheetNodes[label].push(network.nodes[id]);

              return network;
            })
          )
      )
    );
  }

  private addConnections(
    network: ModelNetwork,
    m: Model,
    pathParam: HttpParams
  ): Observable<ModelNetwork> {
    return concat(
      ...m.connections.map(({ src, target }) =>
        this.http
          .consumeStream('model/connections', {
            params: pathParam.append('src', src).append('tgt', target),
            method: 'GET',
          })
          .pipe(
            this.parseCSV<{
              srcIndex: number;
              tgtIndex: number;
              weight: number;
              delay: number;
            }>(['srcIndex', 'tgtIndex', 'weight', 'delay']),
            map((edge) => {
              const srcNode = network.sheetNodes[src][edge.srcIndex];
              const tgtNode = network.sheetNodes[target][edge.tgtIndex];
              srcNode.sheets[src].connections.push({
                sheet: target,
                node: tgtNode.id,
                delay: edge.delay,
                weight: edge.weight,
              });
              return network;
            })
          )
      )
    );
  }
}
