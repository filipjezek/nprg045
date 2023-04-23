import * as d3 from 'd3';
import { Directional } from '../ds-pages/model-page/network-graph/network-graph.component';

export class SVGRef {
  /**
   * a group translated by the margins
   */
  public el: d3.Selection<SVGGElement, any, any, any>;
  /**
   * the svg root element
   */
  public rootEl: d3.Selection<Element, any, any, any>;
  public width: number;
  public height: number;
  public margin: Directional<number>;

  constructor(
    container: HTMLElement,
    options: {
      width: number;
      height: number;
      margin: Directional<number>;
    }
  ) {
    this.width = options.width;
    this.height = options.height;
    this.margin = options.margin;
    this.init(container);
  }

  private init(container: HTMLElement) {
    this.rootEl = d3
      .select(container)
      .append<Element>('svg')
      .attr(
        'viewBox',
        `0 0 ${this.width + this.margin.left + this.margin.right} ${
          this.height + this.margin.top + this.margin.bottom
        }`
      )
      .attr('width', '100%');

    this.el = this.rootEl
      .append('g')
      .classed('content', true)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }
}
