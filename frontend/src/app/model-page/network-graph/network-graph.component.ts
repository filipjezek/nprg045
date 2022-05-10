import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NetworkNode } from 'src/app/store/reducers/model.reducer';
import * as d3 from 'd3';

export interface Directional<T> {
  top: T;
  bottom: T;
  left: T;
  right: T;
}

@Component({
  selector: 'mozaik-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkGraphComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  @Input() nodes: NetworkNode[];
  @Input() sheetName: string;
  @Output() select = new EventEmitter<NetworkNode[]>();

  private scales: {
    x: d3.ScaleLinear<any, any>;
    y: d3.ScaleLinear<any, any>;
  } = {
    x: null,
    y: null,
  };
  private axes: Directional<{
    g: d3.Selection<SVGGElement, any, any, any>;
    axis: d3.Axis<number>;
  }> = {
    top: { axis: null, g: null },
    bottom: { axis: null, g: null },
    left: { axis: null, g: null },
    right: { axis: null, g: null },
  };
  private circles: d3.Selection<SVGGElement, any, any, any>;
  private grid: d3.Selection<SVGGElement, any, any, any>;

  private readonly width = 410;
  private readonly height = 410;
  private readonly margin = {
    left: 60,
    right: 60,
    top: 20,
    bottom: 20,
  };

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const svg = d3
        .select(this.container.nativeElement)
        .append('svg')
        .attr(
          'viewBox',
          `0 0 ${this.width + this.margin.left + this.margin.right} ${
            this.height + this.margin.top + this.margin.bottom
          }`
        )
        .attr('width', '100%')
        .append('g')
        .classed('content', true)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
      this.grid = svg
        .append('g')
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1);
      this.circles = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');

      this.initAxes(svg);
      this.redraw();
      this.initZoom();
    });
  }

  private redraw() {
    this.circles
      .selectAll('path')
      .data(this.nodes)
      .join('path')
      .classed('node', true)
      .attr(
        'd',
        (n) =>
          `M${this.scales.x(n.sheets[this.sheetName].x)},${this.scales.y(
            n.sheets[this.sheetName].y
          )}h0`
      );
  }

  private initAxes(svg: d3.Selection<any, any, any, any>) {
    this.scales.x = d3
      .scaleLinear()
      .domain(d3.extent(this.nodes, (node) => node.sheets[this.sheetName].x))
      .nice()
      .range([0, this.width]);
    this.scales.y = d3
      .scaleLinear()
      .domain(d3.extent(this.nodes, (node) => node.sheets[this.sheetName].y))
      .nice()
      .range([0, this.height]);

    this.axes.bottom.g = svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`);
    this.axes.top.g = svg.append('g');
    this.axes.left.g = svg.append('g');
    this.axes.right.g = svg
      .append('g')
      .attr('transform', `translate(${this.width}, 0)`);
  }

  private redrawAxes(
    x?: d3.ScaleLinear<any, any>,
    y?: d3.ScaleLinear<any, any>
  ) {
    if (!x) x = this.scales.x;
    if (!y) y = this.scales.y;

    this.axes.bottom.axis = d3.axisBottom<number>(x);
    this.axes.top.axis = d3.axisTop<number>(x);
    this.axes.left.axis = d3.axisLeft<number>(y);
    this.axes.right.axis = d3.axisRight<number>(y);
    this.axes.bottom.g.call(this.axes.bottom.axis);
    this.axes.top.g.call(this.axes.top.axis);
    this.axes.left.g.call(this.axes.left.axis);
    this.axes.right.g.call(this.axes.right.axis);
  }

  private redrawGrid(
    x?: d3.ScaleLinear<any, any>,
    y?: d3.ScaleLinear<any, any>
  ) {
    if (!x) x = this.scales.x;
    if (!y) y = this.scales.y;

    this.grid
      .call((g) =>
        g
          .selectAll('.x')
          .data(x.ticks())
          .join(
            (enter) =>
              enter.append('line').attr('class', 'x').attr('y2', this.height),
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
              enter.append('line').attr('class', 'y').attr('x2', this.width),
            (update) => update,
            (exit) => exit.remove()
          )
          .attr('y1', (d) => 0.5 + y(d))
          .attr('y2', (d) => 0.5 + y(d))
      );
  }

  private initZoom() {
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 32])
      .on('zoom', (e: d3.D3ZoomEvent<Element, any>) => {
        const zx = e.transform
          .rescaleX(this.scales.x)
          .interpolate(d3.interpolateRound);
        const zy = e.transform
          .rescaleY(this.scales.y)
          .interpolate(d3.interpolateRound);
        this.redrawAxes(zx, zy);

        this.circles
          .attr('transform', e.transform.toString())
          .attr('stroke-width', 7 / e.transform.k);
        this.redrawGrid(zx, zy);
      });

    d3.select(this.container.nativeElement)
      .select<Element>('svg')
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity);
  }
}
