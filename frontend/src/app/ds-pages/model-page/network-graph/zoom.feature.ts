import { NetworkNode } from 'src/app/store/reducers/model.reducer';
import { Directional, AnySelection } from './network-graph.component';
import * as d3 from 'd3';
import { SVGRef } from '../../../utils/svg-ref';
import { Injectable } from '@angular/core';

/**
 * factory method to allow dependency injection and improve testability
 */
@Injectable()
export class ZoomFeatureFactory {
  public createZoomFeature(
    nodes: NetworkNode[],
    sheetName: string,
    svg: SVGRef,
    zoomCallback?: (t: d3.ZoomTransform) => void
  ) {
    return new ZoomFeature(nodes, sheetName, svg, zoomCallback);
  }
}

export class ZoomFeature {
  private scales: {
    x: d3.ScaleLinear<any, any>;
    y: d3.ScaleLinear<any, any>;
  } = {
    x: null,
    y: null,
  };
  private axes: Directional<{
    g: AnySelection;
    axis: d3.Axis<number>;
  }> = {
    top: { axis: null, g: null },
    bottom: { axis: null, g: null },
    left: { axis: null, g: null },
    right: { axis: null, g: null },
  };
  private grid: AnySelection;

  constructor(
    private nodes: NetworkNode[],
    private sheetName: string,
    private svg: SVGRef,
    private zoomCallback?: (t: d3.ZoomTransform) => void
  ) {
    this.initAxes();
    this.initGrid();
    this.initZoom();
  }

  private redrawAxes(
    x?: d3.ScaleLinear<any, any>,
    y?: d3.ScaleLinear<any, any>
  ) {
    x = x ?? this.scales.x;
    y = y ?? this.scales.y;

    this.axes.bottom.axis = d3.axisBottom<number>(x);
    this.axes.top.axis = d3.axisTop<number>(x);
    this.axes.left.axis = d3.axisLeft<number>(y);
    this.axes.right.axis = d3.axisRight<number>(y);
    this.axes.bottom.g.call(this.axes.bottom.axis);
    this.axes.top.g.call(this.axes.top.axis);
    this.axes.left.g.call(this.axes.left.axis);
    this.axes.right.g.call(this.axes.right.axis);
  }

  private initAxes() {
    this.scales.x = d3
      .scaleLinear()
      .domain(d3.extent(this.nodes, (node) => node.sheets[this.sheetName].x))
      .nice()
      .range([0, this.svg.width]);
    this.scales.y = d3
      .scaleLinear()
      .domain(d3.extent(this.nodes, (node) => node.sheets[this.sheetName].y))
      .nice()
      .range([0, this.svg.height]);

    this.axes.bottom.g = this.svg.el
      .append('g')
      .attr('transform', `translate(0, ${this.svg.height})`);
    this.axes.top.g = this.svg.el.append('g');
    this.axes.left.g = this.svg.el.append('g');
    this.axes.right.g = this.svg.el
      .append('g')
      .attr('transform', `translate(${this.svg.width}, 0)`);
  }

  private redrawGrid(
    x?: d3.ScaleLinear<any, any>,
    y?: d3.ScaleLinear<any, any>
  ) {
    x = x ?? this.scales.x;
    y = y ?? this.scales.y;

    this.grid
      .call((g) =>
        g
          .selectAll('.x')
          .data(x.ticks())
          .join(
            (enter) =>
              enter
                .append('line')
                .attr('class', 'x')
                .attr('y2', this.svg.height),
            (update) => update,
            (exit) => exit.remove()
          )
          .attr('x1', (d) => 0.5 + x(d))
          .attr('x2', (d) => 0.5 + x(d))
      )
      .call((g) =>
        g
          .selectAll('.y')
          .data(y.ticks())
          .join(
            (enter) =>
              enter
                .append('line')
                .attr('class', 'y')
                .attr('x2', this.svg.width),
            (update) => update,
            (exit) => exit.remove()
          )
          .attr('y1', (d) => 0.5 + y(d))
          .attr('y2', (d) => 0.5 + y(d))
      );
  }

  private initGrid() {
    this.grid = this.svg.el
      .append('g')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.1);
  }

  private initZoom() {
    const zoom = d3
      .zoom()
      .filter((event: MouseEvent) => {
        return (
          (!event.ctrlKey || event.type === 'wheel') &&
          !event.button &&
          !event.altKey &&
          !event.shiftKey
        );
      })
      .scaleExtent([0.5, 32])
      .on('zoom', (e: d3.D3ZoomEvent<Element, any>) => {
        const t = e.transform
          .scale(1 / e.transform.k)
          .translate(-this.svg.margin.left, -this.svg.margin.top)
          .scale(e.transform.k);
        const zoomedX = t
          .rescaleX(this.scales.x)
          .interpolate(d3.interpolateRound);
        const zoomedY = t
          .rescaleY(this.scales.y)
          .interpolate(d3.interpolateRound);
        this.redrawAxes(zoomedX, zoomedY);
        this.redrawGrid(zoomedX, zoomedY);

        this.zoomCallback?.(t);
      });

    this.svg.rootEl
      .call(zoom)
      .call(
        zoom.transform,
        new d3.ZoomTransform(1, this.svg.margin.left, this.svg.margin.top)
      );
  }

  public transformX(node: NetworkNode) {
    return this.scales.x(node.sheets[this.sheetName].x);
  }

  public transformY(node: NetworkNode) {
    return this.scales.y(node.sheets[this.sheetName].y);
  }
}
