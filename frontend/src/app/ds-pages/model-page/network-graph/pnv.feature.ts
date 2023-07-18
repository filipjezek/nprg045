import * as d3 from 'd3';
import { PNVData } from './network-graph.component';
import { Connection, NetworkNode } from 'src/app/store/reducers/model.reducer';
import { Injectable } from '@angular/core';
import { AnySelection } from 'src/app/utils/svg-ref';
import { Extent, defaultScale } from '../../common/scale/scale.component';

/**
 * factory method to allow dependency injection and improve testability
 */
@Injectable({
  providedIn: 'root',
})
export class PNVFeatureFactory {
  public createPNVFeature(
    circles: AnySelection,
    nodes: NetworkNode[],
    edges: AnySelection
  ) {
    return new PNVFeature(circles, nodes, edges);
  }
}

export class PNVFeature {
  private pnvScale: {
    linear: d3.ScaleSequential<any, any>;
    periodic: d3.ScaleSequential<any, any>;
  } = { linear: null, periodic: null };
  public get pnvLength() {
    return this._pnvLength;
  }
  private _pnvLength = 0;
  private pnv: PNVData;
  private pnvFilter: Extent;

  constructor(
    private circles: AnySelection,
    private nodes: NetworkNode[],
    private edges: AnySelection
  ) {}

  private recalcZScales() {
    this.pnvScale.linear = d3
      .scaleSequential(defaultScale(false))
      .domain([this.pnvFilter.min, this.pnvFilter.max]);
    if (this.pnv.period) {
      this.pnvScale.periodic = d3
        .scaleSequential(defaultScale(true))
        .domain([0, this.pnv.period]);
    }
  }

  public getColor(id: number) {
    return this.pnv.period
      ? this.pnvScale.periodic(this.pnv.values.get(id) % this.pnv.period)
      : this.pnvScale.linear(this.pnv.values.get(id));
  }

  public setData(pnv: PNVData, pnvFilter: Extent) {
    if (pnv?.values === this.pnv?.values && pnvFilter === this.pnvFilter)
      return;
    this.pnv = pnv;
    this.pnvFilter = pnvFilter;
    this.recalcZScales();
  }

  public filterPnv() {
    this._pnvLength = 0;
    this.circles
      .selectAll<d3.BaseType, NetworkNode>('.node')
      .classed('hidden', (n) => {
        const val = this.pnv.values.get(n.id);
        const res = val < this.pnvFilter.min || val > this.pnvFilter.max;
        if (!res) ++this._pnvLength;
        return res;
      });
  }

  public filterEdges() {
    this.edges
      .selectAll<d3.BaseType, Connection>('.link')
      .classed('hidden', (conn) => {
        const from = this.pnv.values.get(conn.from);
        const to = this.pnv.values.get(conn.to);
        return (
          from < this.pnvFilter.min ||
          from > this.pnvFilter.max ||
          to < this.pnvFilter.min ||
          to > this.pnvFilter.max
        );
      });
  }

  public redraw() {
    return this.circles
      .selectAll('path')
      .data(this.nodes.filter((n) => this.pnv.values.has(n.id)))
      .join('path')
      .classed('pnv', true)
      .style('stroke', (n) => this.getColor(n.id));
  }
}
