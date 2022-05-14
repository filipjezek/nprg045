import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges,
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

export enum EdgeDirection {
  incoming = 'incoming',
  outgoing = 'outgoing',
  all = 'all',
}

@Component({
  selector: 'mozaik-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkGraphComponent implements AfterViewInit, OnChanges {
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  @Input() nodes: NetworkNode[];
  @Input() sheetName: string;
  @Input() allNodes: NetworkNode[];
  @Input() get selectedNodes(): NetworkNode[] {
    return this._selectedNodes;
  }
  set selectedNodes(nodes: NetworkNode[]) {
    if (this._selectedNodes === nodes) return;
    this._selectedNodes = nodes;
  }
  private _selectedNodes: NetworkNode[] = [];
  @Input() edgeDir: EdgeDirection;
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
  private edges: d3.Selection<SVGGElement, any, any, any>;
  private grid: d3.Selection<SVGGElement, any, any, any>;
  private svg: d3.Selection<SVGGElement, any, any, any>;

  private readonly width = 410;
  private readonly height = 410;
  private readonly margin = {
    left: 60,
    right: 60,
    top: 50,
    bottom: 50,
  };

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.svg = d3
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

      const defs = this.svg.append('defs');
      for (const classes of ['incoming', 'outgoing', 'incoming outgoing']) {
        defs
          .append('marker')
          .attr('id', 'arrowhead-' + classes.replace(' ', '-'))
          .classed(classes + ' arrowhead', true)
          .attr('viewBox', '-0 -5 10 10')
          .attr('refX', 10)
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5');
      }
      this.grid = this.svg
        .append('g')
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1);
      this.circles = this.svg.append('g');
      this.edges = this.circles.append('g');
      this.circles.attr('fill', 'none').attr('stroke-linecap', 'round');

      this.initAxes();
      this.redraw();
      this.initZoom();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['edgeDir'] || changes['selectedNodes']) {
      if (this.svg) {
        this.updateSelection();
      }
    }
  }

  private redraw() {
    this.circles
      .selectAll('path')
      .data(this.nodes)
      .join('path')
      .classed('node', true)
      .attr('d', (n) => `M${this.displayX(n)},${this.displayY(n)}h0`)
      .attr('data-id', (n) => n.id);
  }

  private initAxes() {
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

    this.axes.bottom.g = this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`);
    this.axes.top.g = this.svg.append('g');
    this.axes.left.g = this.svg.append('g');
    this.axes.right.g = this.svg
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
        this.edges.attr('stroke-width', 2 / e.transform.k);
        this.redrawGrid(zx, zy);
      });

    d3.select(this.container.nativeElement)
      .select<Element>('svg')
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity);
  }

  private updateEdges() {
    interface Edge {
      weight: number;
      delay: number;
      from: number;
      to: number;
    }
    let inLinks: Edge[] = [];
    let outLinks: Edge[] = [];
    const set = new Set(this.selectedNodes.map((n) => n.id));
    if (
      this.edgeDir === EdgeDirection.outgoing ||
      this.edgeDir === EdgeDirection.all
    ) {
      outLinks = this.selectedNodes.flatMap(
        (n) =>
          n.sheets[this.sheetName]?.connections
            .filter((conn) => conn.sheet === this.sheetName)
            .map((conn) => ({
              weight: conn.weight,
              delay: conn.delay,
              from: n.id,
              to: conn.node,
            })) || []
      );
    }
    if (
      this.edgeDir === EdgeDirection.incoming ||
      this.edgeDir === EdgeDirection.all
    ) {
      inLinks = this.allNodes.flatMap(
        (n) =>
          n.sheets[this.sheetName]?.connections
            .filter(
              (conn) => conn.sheet === this.sheetName && set.has(conn.node)
            )
            .map((conn) => ({
              weight: conn.weight,
              delay: conn.delay,
              from: n.id,
              to: conn.node,
            })) || []
      );
    }

    inLinks.forEach((conn) =>
      this.circles.select(`[data-id="${conn.from}"]`).classed('neighbor', true)
    );
    outLinks.forEach((conn) =>
      this.circles.select(`[data-id="${conn.to}"]`).classed('neighbor', true)
    );

    this.edges
      .selectAll('.link')
      .data([...inLinks, ...outLinks])
      .join(
        (enter) => enter.append('line').classed('link', true),
        (update) => update,
        (exit) => exit.remove()
      )
      .classed('incoming', (conn) => set.has(conn.to))
      .classed('outgoing', (conn) => set.has(conn.from))
      .attr(
        'marker-end',
        (conn) =>
          `url(#arrowhead${set.has(conn.to) ? '-incoming' : ''}${
            set.has(conn.from) ? '-outgoing' : ''
          })`
      )
      .attr('x1', (conn) => this.displayX(this.allNodes[conn.from]))
      .attr('y1', (conn) => this.displayY(this.allNodes[conn.from]))
      .attr('x2', (conn) => this.displayX(this.allNodes[conn.to]))
      .attr('y2', (conn) => this.displayY(this.allNodes[conn.to]));
  }

  private updateSelection() {
    this.circles
      .selectAll('.selected, .neighbor')
      .classed('selected neighbor', false);
    this.updateEdges();
    this.selectedNodes.forEach((n) =>
      this.circles.select(`[data-id="${n.id}"]`).classed('selected', true)
    );
  }

  handleClick(e: MouseEvent) {
    const tgt: HTMLElement = e.target as HTMLElement;
    if (tgt.matches('.node')) {
      const id = +tgt.dataset['id'];
      if (tgt.classList.contains('selected')) {
        if (e.shiftKey) {
          this.selectedNodes = this.selectedNodes.filter((n) => n.id !== id);
        } else {
          this.selectedNodes = [];
        }
      } else {
        if (e.shiftKey) {
          this.selectedNodes = [...this.selectedNodes, this.allNodes[id]];
        } else {
          this.selectedNodes = [this.allNodes[id]];
        }
      }
    }
    this.select.emit(this.selectedNodes);
  }

  private displayX(node: NetworkNode) {
    return this.scales.x(node.sheets[this.sheetName].x);
  }
  private displayY(node: NetworkNode) {
    return this.scales.y(node.sheets[this.sheetName].y);
  }
}
