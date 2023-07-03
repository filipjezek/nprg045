import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  auditTime,
  concat,
  concatWith,
  delay,
  from,
  last,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { HttpService } from './http.service';
import { ModelNetwork } from '../store/reducers/model.reducer';
import * as csv from 'csv/browser/esm';
import { Action, Store } from '@ngrx/store';
import { State } from '../store/reducers';
import {
  connectionsLoadingProgress,
  metadataLoaded,
  positionsLoadingProgress,
} from '../store/actions/model.actions';

export interface TransportModel {
  sheets: TransportSheet[];
  connections: TransportConnections[];
}

export interface TransportConnections {
  src: string; // sheet
  target: string; // sheet
  size: number;
}

export interface TransportSheet {
  label: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private readonly progressThrottle = 200;

  constructor(private http: HttpService, private store: Store<State>) {}

  public loadModel(path: string): Observable<ModelNetwork> {
    const pathParam = new HttpParams().append('path', path);
    return this.http.get<TransportModel>('model', pathParam).pipe(
      switchMap((m) => {
        this.store.dispatch(
          metadataLoaded({
            meta: {
              connections: m.connections.map((conn) => ({
                from: conn.src,
                to: conn.target,
                size: conn.size,
              })),
              positions: m.sheets.map((pos) => ({
                sheet: pos.label,
                size: pos.size,
              })),
            },
          })
        );
        const network = this.prepareSkeleton(m);
        return this.addPositions(network, m, pathParam)
          .pipe
          // concatWith(this.addConnections(network, m, pathParam))
          ();
      }),
      last()
    );
  }

  private prepareSkeleton(model: TransportModel): ModelNetwork {
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
    m: TransportModel,
    pathParam: HttpParams
  ): Observable<ModelNetwork> {
    return concat(
      ...m.sheets.map(({ label }) => {
        const reporter = new Subject<Action>();
        const sub = reporter
          .pipe(auditTime(this.progressThrottle))
          .subscribe((a) => this.store.dispatch(a));

        return this.http
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
            map(({ id, x, y }, i) => {
              if (!network.nodes[id]) {
                network.nodes[id] = { id, sheets: {} };
              }
              reporter.next(
                positionsLoadingProgress({ sheet: label, current: i + 1 })
              );

              network.nodes[id].sheets[label] = {
                x,
                y,
                connections: [],
              };
              network.sheetNodes[label].push(network.nodes[id]);

              return network;
            }),
            last(),
            tap(() => {
              sub.unsubscribe();
              reporter.complete();
            })
          );
      })
    );
  }

  private addConnections(
    network: ModelNetwork,
    m: TransportModel,
    pathParam: HttpParams
  ): Observable<ModelNetwork> {
    return concat(
      ...m.connections.map(({ src, target }) => {
        const reporter = new Subject<Action>();
        const sub = reporter
          .pipe(auditTime(this.progressThrottle))
          .subscribe((a) => this.store.dispatch(a));

        return this.http
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
            map((edge, i) => {
              reporter.next(
                connectionsLoadingProgress({ src, tgt: target, current: i + 1 })
              );
              const srcNode = network.sheetNodes[src][edge.srcIndex];
              const tgtNode = network.sheetNodes[target][edge.tgtIndex];
              srcNode.sheets[src].connections.push({
                sheet: target,
                node: tgtNode.id,
                delay: edge.delay,
                weight: edge.weight,
              });
              return network;
            }),
            last(),
            tap(() => {
              sub.unsubscribe();
              reporter.complete();
            })
          );
      })
    );
  }
}
