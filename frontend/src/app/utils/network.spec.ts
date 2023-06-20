import { NetworkNode } from '../store/reducers/model.reducer';
import {
  getAllIncomingConnections,
  getIncomingConnections,
  getOutgoingConnections,
} from './network';

fdescribe('network utils', () => {
  const network: NetworkNode[] = [
    {
      id: 0,
      sheets: {
        a: {
          x: 0,
          y: 0,
          connections: [{ delay: 0, weight: 0, node: 1, sheet: 'a' }],
        },
        b: {
          x: 0,
          y: 0,
          connections: [{ delay: 0, weight: 0, node: 1, sheet: 'a' }],
        },
      },
    },
    {
      id: 1,
      sheets: {
        a: {
          x: 0,
          y: 0,
          connections: [
            { delay: 0, weight: 0, node: 2, sheet: 'a' },
            { delay: 0, weight: 0, node: 3, sheet: 'a' },
            { delay: 0, weight: 0, node: 3, sheet: 'b' },
          ],
        },
        b: {
          x: 0,
          y: 0,
          connections: [{ delay: 0, weight: 0, node: 2, sheet: 'b' }],
        },
      },
    },
    {
      id: 2,
      sheets: {
        a: {
          x: 0,
          y: 0,
          connections: [],
        },
        b: {
          x: 0,
          y: 0,
          connections: [
            { delay: 0, weight: 0, node: 1, sheet: 'a' },
            { delay: 0, weight: 0, node: 0, sheet: 'a' },
            { delay: 0, weight: 0, node: 3, sheet: 'b' },
          ],
        },
      },
    },
    {
      id: 3,
      sheets: {
        a: {
          x: 0,
          y: 0,
          connections: [{ delay: 0, weight: 0, node: 1, sheet: 'b' }],
        },
        b: {
          x: 0,
          y: 0,
          connections: [{ delay: 0, weight: 0, node: 1, sheet: 'b' }],
        },
      },
    },
  ];

  describe('getOutgoingConnections', () => {
    it('should get outgoing connections in a given sheet', () => {
      expect(getOutgoingConnections([network[0], network[1]], 'a')).toEqual([
        { weight: 0, delay: 0, from: 0, to: 1 },
        { weight: 0, delay: 0, from: 1, to: 2 },
        { weight: 0, delay: 0, from: 1, to: 3 },
      ]);
    });
  });
  describe('getIncomingConnections', () => {
    it('should get incoming connections in a given sheet', () => {
      expect(getIncomingConnections(new Set([1, 2]), 'b', network)).toEqual([
        { weight: 0, delay: 0, from: 1, to: 2 },
        { weight: 0, delay: 0, from: 3, to: 1 },
      ]);
    });
  });
  describe('getAllIncomingConnections', () => {
    it('should get all incoming connections', () => {
      expect(getAllIncomingConnections(network[1], network)).toEqual({
        a: [
          { weight: 0, delay: 0, from: 0, to: 1 },
          { weight: 0, delay: 0, from: 3, to: 1 },
        ],
        b: [
          { weight: 0, delay: 0, from: 0, to: 1 },
          { weight: 0, delay: 0, from: 2, to: 1 },
          { weight: 0, delay: 0, from: 3, to: 1 },
        ],
      });
    });
  });
});
