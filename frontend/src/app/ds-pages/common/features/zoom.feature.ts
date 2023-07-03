import * as d3 from 'd3';
import { AnySelection, SVGRef } from '../../../utils/svg-ref';

/**
 * @param t transform object
 * @param tx transformed x scale
 * @param ty transformed y scale
 */
export type ZoomCallback = (
  t: d3.ZoomTransform,
  tx: d3.ScaleLinear<any, any>,
  ty: d3.ScaleLinear<any, any>
) => void;

export class ZoomFeature {
  protected scales: {
    x: d3.ScaleLinear<any, any>;
    y: d3.ScaleLinear<any, any>;
  } = {
    x: null,
    y: null,
  };
  protected axes: Directional<{
    g: AnySelection;
    axis: d3.Axis<number>;
  }> = {
    top: { axis: null, g: null },
    bottom: { axis: null, g: null },
    left: { axis: null, g: null },
    right: { axis: null, g: null },
  };
  protected zoom: d3.ZoomBehavior<Element, any>;

  public get transform() {
    return this._transform;
  }
  private _transform: d3.ZoomTransform;

  protected extent = {
    x: [0, 1],
    y: [0, 1],
    zoom: [0.5, 32] as [number, number],
  };

  constructor(protected svg: SVGRef, protected zoomCallback?: ZoomCallback) {}

  protected init() {
    this.initAxes();
    this.initZoom();
  }

  protected redrawAxes(
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

  protected initAxes() {
    this.scales.x = d3
      .scaleLinear()
      .domain(this.extent.x)
      .nice()
      .range([0, this.svg.width]);
    this.scales.y = d3
      .scaleLinear()
      .domain(this.extent.y)
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

  private initZoom() {
    this.zoom = d3
      .zoom()
      .filter((event: MouseEvent) => {
        return (
          (!event.ctrlKey || event.type === 'wheel') &&
          !event.button &&
          !event.altKey &&
          !event.shiftKey
        );
      })
      .scaleExtent(this.extent.zoom)
      .on('zoom', (e: d3.D3ZoomEvent<Element, any>) => {
        this._transform = e.transform;
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

        this.zoomCallback?.(t, zoomedX, zoomedY);
      });

    this.svg.rootEl
      .call(this.zoom)
      .call(
        this.zoom.transform,
        new d3.ZoomTransform(1, this.svg.margin.left, this.svg.margin.top)
      );
  }
}
