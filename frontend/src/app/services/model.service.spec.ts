import {
  TestBed,
  fakeAsync,
  flush,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from './http.service';

import { TransportModel, ModelService } from './model.service';
import { Store } from '@ngrx/store';
import { StoreStub } from '../testing/store.stub';
import { State } from '../store/reducers';
import { metadataLoaded } from '../store/actions/model.actions';
import { ModelNetwork } from '../store/reducers/model.reducer';

describe('ModelService', () => {
  let service: ModelService;
  let httpStub: jasmine.SpyObj<HttpService>;
  let store: StoreStub<State>;
  let transportSubj: Subject<TransportModel>;
  let csvSubj: {
    pos1: Subject<string>;
    pos2: Subject<string>;
    conn: Subject<string>;
  };
  const unsub = new Subject<void>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: jasmine.createSpyObj('httpStub', ['get', 'consumeStream']),
        },
        { provide: Store, useClass: StoreStub },
      ],
    });
    service = TestBed.inject(ModelService);
    httpStub = TestBed.inject(HttpService) as any;
    store = TestBed.inject(Store) as any;

    transportSubj = new Subject<TransportModel>();
    csvSubj = {
      conn: new Subject(),
      pos1: new Subject(),
      pos2: new Subject(),
    };
    httpStub.get.and.returnValue(transportSubj);
    httpStub.consumeStream.and.callFake((url, { params }) => {
      if (url.endsWith('positions')) {
        if (params.get('sheet') == 'a') return csvSubj.pos1;
        return csvSubj.pos2;
      }
      return csvSubj.conn;
    });
  });

  afterEach(() => {
    unsub.next();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load metadata first', fakeAsync(() => {
    service
      .loadModel('path')
      .pipe(takeUntil(unsub))
      .subscribe(() => {});
    transportSubj.next({
      connections: [{ size: 5, src: 'a', target: 'b' }],
      sheets: [
        { label: 'a', size: 3 },
        { label: 'b', size: 2 },
      ],
    });

    tick();

    expect(store.dispatch).toHaveBeenCalledWith(
      metadataLoaded({
        meta: {
          connections: [{ size: 5, from: 'a', to: 'b' }],
          positions: [
            { sheet: 'a', size: 3 },
            { sheet: 'b', size: 2 },
          ],
        },
      })
    );
  }));

  it('should load positions and connections', fakeAsync(() => {
    let result: ModelNetwork;
    service
      .loadModel('path')
      .pipe(takeUntil(unsub))
      .subscribe((res) => {
        result = res;
      });
    transportSubj.next({
      connections: [{ size: 5, src: 'a', target: 'b' }],
      sheets: [
        { label: 'a', size: 3 },
        { label: 'b', size: 2 },
      ],
    });
    transportSubj.complete();

    tick();
    // id, x, y
    csvSubj.pos1.next('0,3,4\n1,7.6');
    csvSubj.pos1.next(',2\n2,4,8\n');
    csvSubj.pos1.complete();

    tick();
    csvSubj.pos2.next('0,2,7\n2,5,2');
    csvSubj.pos2.complete();

    tick();
    // srcIndex, tgtIndex, weight, delay
    csvSubj.conn.next('0,1,2,7\n2,1,5,2\n');
    csvSubj.conn.next('1,0,3,1\n0,0,8,6\n');
    csvSubj.conn.next('2,0,0,0');
    csvSubj.conn.complete();
    flush();
    flushMicrotasks();

    expect(result).toEqual({
      nodes: [
        {
          id: 0,
          sheets: {
            a: {
              x: 3,
              y: 4,
              connections: [
                { sheet: 'b', node: 2, delay: 7, weight: 2 },
                { sheet: 'b', node: 0, delay: 6, weight: 8 },
              ],
            },
            b: { x: 2, y: 7, connections: [] },
          },
        },
        {
          id: 1,
          sheets: {
            a: {
              x: 7.6,
              y: 2,
              connections: [{ sheet: 'b', node: 0, delay: 1, weight: 3 }],
            },
          },
        },
        {
          id: 2,
          sheets: {
            a: {
              x: 4,
              y: 8,
              connections: [
                { sheet: 'b', node: 2, delay: 2, weight: 5 },
                { sheet: 'b', node: 0, delay: 0, weight: 0 },
              ],
            },
            b: { x: 5, y: 2, connections: [] },
          },
        },
      ],
      sheetNodes: {
        a: [
          {
            id: 0,
            sheets: {
              a: {
                x: 3,
                y: 4,
                connections: [
                  { sheet: 'b', node: 2, delay: 7, weight: 2 },
                  { sheet: 'b', node: 0, delay: 6, weight: 8 },
                ],
              },
              b: { x: 2, y: 7, connections: [] },
            },
          },
          {
            id: 1,
            sheets: {
              a: {
                x: 7.6,
                y: 2,
                connections: [{ sheet: 'b', node: 0, delay: 1, weight: 3 }],
              },
            },
          },
          {
            id: 2,
            sheets: {
              a: {
                x: 4,
                y: 8,
                connections: [
                  { sheet: 'b', node: 2, delay: 2, weight: 5 },
                  { sheet: 'b', node: 0, delay: 0, weight: 0 },
                ],
              },
              b: { x: 5, y: 2, connections: [] },
            },
          },
        ],
        b: [
          {
            id: 0,
            sheets: {
              a: {
                x: 3,
                y: 4,
                connections: [
                  { sheet: 'b', node: 2, delay: 7, weight: 2 },
                  { sheet: 'b', node: 0, delay: 6, weight: 8 },
                ],
              },
              b: { x: 2, y: 7, connections: [] },
            },
          },
          {
            id: 2,
            sheets: {
              a: {
                x: 4,
                y: 8,
                connections: [
                  { sheet: 'b', node: 2, delay: 2, weight: 5 },
                  { sheet: 'b', node: 0, delay: 0, weight: 0 },
                ],
              },
              b: { x: 5, y: 2, connections: [] },
            },
          },
        ],
      },
    });
  }));
});
