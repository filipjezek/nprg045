import { Injectable } from '@angular/core';
import { ZoomCallback, ZoomFeature } from '../../common/features/zoom.feature';
import { SVGRef } from 'src/app/utils/svg-ref';
import * as d3 from 'd3';

/**
 * factory method to allow dependency injection and improve testability
 */
@Injectable({
  providedIn: 'root',
})
export class MatrixZoomFeatureFactory {
  public createZoomFeature(
    ids: number[],
    svg: SVGRef,
    zoomCallback?: ZoomCallback
  ) {
    return new MatrixZoomFeature(ids, svg, zoomCallback);
  }
}

export class MatrixZoomFeature extends ZoomFeature {
  constructor(private ids: number[], svg: SVGRef, zoomCallback?: ZoomCallback) {
    super(svg, zoomCallback);
    const temp = this.zoomCallback;
    this.zoomCallback = (t, tx, ty) => {
      this.enforceExtent(t.k);
      temp?.(t, tx, ty);
    };

    this.init();
  }

  protected override initAxes(): void {
    this.extent = {
      x: [0, this.ids.length],
      y: [0, this.ids.length],
      zoom: [1, (25 / this.svg.width) * this.ids.length],
    };

    const offset = this.svg.width / this.ids.length / 2;

    this.scales.x = d3
      .scaleLinear()
      .domain(this.extent.x)
      .range([offset, this.svg.width + offset]);
    this.scales.y = d3
      .scaleLinear()
      .domain(this.extent.y)
      .range([offset, this.svg.height + offset]);

    this.axes.bottom.g = this.svg.el
      .append('g')
      .attr('transform', `translate(0, ${this.svg.height})`);
    this.axes.top.g = this.svg.el.append('g');
    this.axes.left.g = this.svg.el.append('g');
    this.axes.right.g = this.svg.el
      .append('g')
      .attr('transform', `translate(${this.svg.width}, 0)`);
  }

  protected override redrawAxes(
    x?: d3.ScaleLinear<any, any>,
    y?: d3.ScaleLinear<any, any>
  ) {
    x = x ?? this.scales.x;
    y = y ?? this.scales.y;

    this.axes.bottom.axis = d3
      .axisBottom<number>(x)
      .tickFormat((val) => this.ids[val] + '');
    this.axes.top.axis = d3
      .axisTop<number>(x)
      .tickFormat((val) => this.ids[val] + '');
    this.axes.left.axis = d3
      .axisLeft<number>(y)
      .tickFormat((val) => this.ids[val] + '');
    this.axes.right.axis = d3
      .axisRight<number>(y)
      .tickFormat((val) => this.ids[val] + '');
    this.axes.bottom.g.call(this.axes.bottom.axis);
    this.axes.top.g.call(this.axes.top.axis);
    this.axes.left.g.call(this.axes.left.axis);
    this.axes.right.g.call(this.axes.right.axis);
  }

  private enforceExtent(k: number) {
    this.zoom.translateExtent([
      [-this.svg.margin.left / k, -this.svg.margin.top / k],
      [
        this.svg.width + this.svg.margin.left / k,
        this.svg.height + this.svg.margin.top / k,
      ],
    ]);
  }
}
