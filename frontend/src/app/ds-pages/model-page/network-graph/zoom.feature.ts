import { NetworkNode } from 'src/app/store/reducers/model.reducer';
import * as d3 from 'd3';
import { AnySelection, SVGRef } from '../../../utils/svg-ref';
import { Injectable } from '@angular/core';
import { ZoomCallback, ZoomFeature } from '../../common/features/zoom.feature';

/**
 * factory method to allow dependency injection and improve testability
 */
@Injectable({
  providedIn: 'root',
})
export class PNVZoomFeatureFactory {
  public createZoomFeature(
    nodes: NetworkNode[],
    sheetName: string,
    svg: SVGRef,
    zoomCallback?: ZoomCallback
  ) {
    return new PNVZoomFeature(nodes, sheetName, svg, zoomCallback);
  }
}

export class PNVZoomFeature extends ZoomFeature {
  private grid: AnySelection;

  constructor(
    private nodes: NetworkNode[],
    private sheetName: string,
    svg: SVGRef,
    zoomCallback?: ZoomCallback
  ) {
    super(svg, zoomCallback);
    this.init();
  }

  protected override init(): void {
    this.extent = {
      x: d3.extent(this.nodes, (node) => node.sheets[this.sheetName].x),
      y: d3.extent(this.nodes, (node) => node.sheets[this.sheetName].y),
      zoom: [0.5, 32],
    };
    const temp = this.zoomCallback;
    this.zoomCallback = (t, tx, ty) => {
      this.redrawGrid(tx, ty);
      temp?.(t, tx, ty);
    };
    this.initGrid();
    super.init();
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

  public transformX(node: NetworkNode) {
    return this.scales.x(node.sheets[this.sheetName].x);
  }

  public transformY(node: NetworkNode) {
    return this.scales.y(node.sheets[this.sheetName].y);
  }
}
