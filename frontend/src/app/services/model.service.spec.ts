import { TestBed } from '@angular/core/testing';
import { Subject, take } from 'rxjs';
import { HttpService } from './http.service';

import { Model, ModelService } from './model.service';

describe('ModelService', () => {
  let service: ModelService;
  let httpStub: jasmine.SpyObj<HttpService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: jasmine.createSpyObj('httpStub', ['get']),
        },
      ],
    });
    service = TestBed.inject(ModelService);
    httpStub = TestBed.inject(HttpService) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse data from server', (done) => {
    const subj = new Subject<Model>();
    httpStub.get.and.returnValue(subj);
    service
      .loadModel('path')
      .pipe(take(1))
      .subscribe(({ model }) => {
        expect(model).toEqual({
          nodes: [
            {
              id: 0,
              sheets: {
                s1: {
                  x: 10,
                  y: 9,
                  connections: [
                    { sheet: 's1', node: 1, delay: 0.1, weight: 0.9 },
                    { sheet: 's1', node: 2, delay: 1.2, weight: 0.4 },
                    { sheet: 's2', node: 5, delay: 0.6, weight: 0.2 },
                    { sheet: 's2', node: 4, delay: 0.8, weight: 0.4 },
                  ],
                },
              },
            },
            {
              id: 1,
              sheets: {
                s1: {
                  x: 8,
                  y: 11,
                  connections: [
                    { sheet: 's1', node: 2, delay: 1.4, weight: 0.2 },
                    { sheet: 's2', node: 3, delay: 0.5, weight: 0.1 },
                    { sheet: 's2', node: 5, delay: 0.7, weight: 0.3 },
                  ],
                },
              },
            },
            {
              id: 2,
              sheets: {
                s1: {
                  x: 5,
                  y: 4,
                  connections: [
                    { sheet: 's1', node: 0, delay: 0.7, weight: 0.87 },
                  ],
                },
              },
            },
            { id: 3, sheets: { s2: { x: -3, y: 19, connections: [] } } },
            { id: 4, sheets: { s2: { x: 7, y: 1, connections: [] } } },
            { id: 5, sheets: { s2: { x: 15, y: 2, connections: [] } } },
          ],
          sheetNodes: {
            s1: [
              {
                id: 0,
                sheets: {
                  s1: {
                    x: 10,
                    y: 9,
                    connections: [
                      { sheet: 's1', node: 1, delay: 0.1, weight: 0.9 },
                      { sheet: 's1', node: 2, delay: 1.2, weight: 0.4 },
                      { sheet: 's2', node: 5, delay: 0.6, weight: 0.2 },
                      { sheet: 's2', node: 4, delay: 0.8, weight: 0.4 },
                    ],
                  },
                },
              },
              {
                id: 1,
                sheets: {
                  s1: {
                    x: 8,
                    y: 11,
                    connections: [
                      { sheet: 's1', node: 2, delay: 1.4, weight: 0.2 },
                      { sheet: 's2', node: 3, delay: 0.5, weight: 0.1 },
                      { sheet: 's2', node: 5, delay: 0.7, weight: 0.3 },
                    ],
                  },
                },
              },
              {
                id: 2,
                sheets: {
                  s1: {
                    x: 5,
                    y: 4,
                    connections: [
                      { sheet: 's1', node: 0, delay: 0.7, weight: 0.87 },
                    ],
                  },
                },
              },
            ],
            s2: [
              { id: 3, sheets: { s2: { x: -3, y: 19, connections: [] } } },
              { id: 4, sheets: { s2: { x: 7, y: 1, connections: [] } } },
              { id: 5, sheets: { s2: { x: 15, y: 2, connections: [] } } },
            ],
          },
        });
        done();
      });

    subj.next({
      sheets: [
        {
          label: 's1',
          neuronPositions: {
            ids: [0, 1, 2],
            x: [10, 8, 5],
            y: [9, 11, 4],
          },
        },
        {
          label: 's2',
          neuronPositions: {
            ids: [3, 4, 5],
            x: [-3, 7, 15],
            y: [19, 1, 2],
          },
        },
      ],
      neurons: [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ],
      connections: [
        {
          src: 's1',
          target: 's1',
          edges: [
            { srcIndex: 0, tgtIndex: 1, weight: 0.9, delay: 0.1 },
            { srcIndex: 0, tgtIndex: 2, weight: 0.4, delay: 1.2 },
            { srcIndex: 1, tgtIndex: 2, weight: 0.2, delay: 1.4 },
            { srcIndex: 2, tgtIndex: 0, weight: 0.87, delay: 0.7 },
          ],
        },
        {
          src: 's1',
          target: 's2',
          edges: [
            { srcIndex: 1, tgtIndex: 0, weight: 0.1, delay: 0.5 },
            { srcIndex: 0, tgtIndex: 2, weight: 0.2, delay: 0.6 },
            { srcIndex: 1, tgtIndex: 2, weight: 0.3, delay: 0.7 },
            { srcIndex: 0, tgtIndex: 1, weight: 0.4, delay: 0.8 },
          ],
        },
      ],
    });
  });
});
