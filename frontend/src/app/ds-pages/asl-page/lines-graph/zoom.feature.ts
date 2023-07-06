import * as d3 from 'd3';
import { AnySelection, SVGRef } from '../../../utils/svg-ref';
import { Injectable } from '@angular/core';
import { ZoomCallback, ZoomFeature } from '../../common/features/zoom.feature';
import { AnalogSignalList } from 'src/app/store/reducers/ads.reducer';

/**
 * factory method to allow dependency injection and improve testability
 */
@Injectable({
  providedIn: 'root',
})
export class LinesZoomFeatureFactory {
  public createZoomFeature(
    asl: AnalogSignalList,
    svg: SVGRef,
    zoomCallback?: ZoomCallback
  ) {
    return new LinesZoomFeature(asl, svg, zoomCallback);
  }
}

export class LinesZoomFeature extends ZoomFeature {
  private grid: AnySelection;

  constructor(
    private asl: AnalogSignalList,
    svg: SVGRef,
    zoomCallback?: ZoomCallback
  ) {
    super(svg, zoomCallback);
    const temp = this.zoomCallback;
    this.zoomCallback = (t, tx, ty) => {
      this.enforceExtent(t.k);
      temp?.(t, tx, ty);
    };
    this.init();
  }

  protected override init(): void {
    this.extent = {
      x: [
        this.asl.startTime,
        this.asl.startTime +
          this.asl.samplingPeriod * this.asl.values[0].length,
      ],
      y: d3.extent(this.asl.values.flatMap((line) => d3.extent(line))),
      zoom: [1, 128],
    };
    this.initGrid();
    super.init();
    this.redrawGrid();
  }

  private redrawGrid(y?: d3.ScaleLinear<any, any>) {
    y = y ?? this.scales.y;

    this.grid.call((g) =>
      g
        .selectAll('.y')
        .data(y.ticks())
        .join(
          (enter) =>
            enter.append('line').attr('class', 'y').attr('x2', this.svg.width),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr('y1', (d) => 0.5 + y(d))
        .attr('y2', (d) => 0.5 + y(d))
    );
  }

  protected override initAxes(): void {
    super.initAxes();
    this.scales.x = d3
      .scaleLinear()
      .domain(this.extent.x)
      .range([0, this.svg.width]);
    this.scales.y = d3
      .scaleLinear()
      .domain(this.extent.y)
      .range([0, this.svg.height]);
  }

  private initGrid() {
    this.grid = this.svg.el
      .append('g')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.1);
  }

  protected override redrawAxes(
    x?: d3.ScaleLinear<any, any>,
    y?: d3.ScaleLinear<any, any>
  ) {
    x = x ?? this.scales.x;
    y = this.scales.y;

    this.axes.bottom.axis = d3.axisBottom<number>(x).ticks(12);
    this.axes.top.axis = d3.axisTop<number>(x).ticks(12);
    this.axes.left.axis = d3.axisLeft<number>(y).ticks(8);
    this.axes.right.axis = d3.axisRight<number>(y).ticks(8);
    this.axes.bottom.g.call(this.axes.bottom.axis);
    this.axes.top.g.call(this.axes.top.axis);
    this.axes.left.g.call(this.axes.left.axis);
    this.axes.right.g.call(this.axes.right.axis);
  }

  private enforceExtent(k: number) {
    this.zoom.translateExtent([
      [-this.svg.margin.left / k, -Infinity],
      [this.svg.width + this.svg.margin.left / k, Infinity],
    ]);
  }

  public transformX(x: number) {
    return this.scales.x(x);
  }
  public transformY(y: number) {
    return this.scales.y(y);
  }
  public invertX(x: number) {
    return this.scales.x.invert(x);
  }
  public invertY(y: number) {
    return this.scales.y.invert(y);
  }
}
