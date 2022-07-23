import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Connection,
  getIncomingConnections,
  getOutgoingConnections,
  NetworkNode,
} from 'src/app/store/reducers/model.reducer';
import * as d3 from 'd3';
import * as d3Lasso from 'd3-lasso';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { takeUntil } from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';

type anySelection = d3.Selection<any, any, any, any>;

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

export interface PNVData {
  values: Map<number, number>;
  period: number;
  unit: string;
}

@Component({
  selector: 'mozaik-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkGraphComponent
  extends UnsubscribingComponent
  implements AfterViewInit, OnChanges, OnInit
{
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  @Input() nodes: NetworkNode[];
  @Input() sheetName: string;
  @Input() allNodes: NetworkNode[];
  @Input() get selectedNodes(): NetworkNode[] {
    return this._selectedNodes;
  }
  set selectedNodes(nodes: NetworkNode[]) {
    if (
      this._selectedNodes === nodes ||
      (!nodes.length && !this._selectedNodes.length)
    )
      return;
    this._selectedNodes = nodes;
  }
  private _selectedNodes: NetworkNode[] = [];
  @Input() edgeDir: EdgeDirection;
  @Input() pnv: PNVData = null;
  @Input() pnvExtent: { min: number; max: number };
  @Input() pnvFilter: { from: number; to: number };
  @Output() select = new EventEmitter<NetworkNode[]>();

  private scales: {
    x: d3.ScaleLinear<any, any>;
    y: d3.ScaleLinear<any, any>;
    z: d3.ScaleSequential<any, any>;
    zPeriodic: d3.ScaleSequential<any, any>;
  } = {
    x: null,
    y: null,
    z: null,
    zPeriodic: null,
  };
  private axes: Directional<{
    g: anySelection;
    axis: d3.Axis<number>;
  }> = {
    top: { axis: null, g: null },
    bottom: { axis: null, g: null },
    left: { axis: null, g: null },
    right: { axis: null, g: null },
  };
  private circles: anySelection;
  private edges: anySelection;
  private grid: anySelection;
  private svg: anySelection;

  private readonly width = 410;
  private readonly height = 410;
  private readonly margin = {
    left: 60,
    right: 60,
    top: 50,
    bottom: 50,
  };

  hoveredEdge: Connection;
  @Input() hoveredNode: NetworkNode;
  @Output() hoveredNodeChange = new EventEmitter<NetworkNode>();
  tooltipPos: Partial<Directional<string>> = { left: '0px', top: '0px' };
  filteredPnv = 0;

  constructor(private gEventS: GlobalEventService) {
    super();
  }

  ngOnInit(): void {
    this.filteredPnv = this.pnv?.values.size;
  }

  ngAfterViewInit(): void {
    this.initSvg();
    this.initAxes();
    this.redraw();
    this.initZoom();
    this.initLasso();

    this.gEventS.escapePressed
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.select.emit([]);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['edgeDir'] || changes['selectedNodes']) {
      if (this.svg) {
        this.updateSelection();
      }
    }
    if (changes['hoveredNode'] && this.svg) {
      if (changes['hoveredNode'].previousValue) {
        this.circles.select('.hovered').classed('hovered', false);
      }
      if (this.hoveredNode && this.hoveredNode.sheets[this.sheetName]) {
        const tgt = this.circles
          .select(`[data-id="${this.hoveredNode.id}"]`)
          .classed('hovered', true);
        const bboxNode = (tgt.node() as HTMLElement).getBoundingClientRect();
        this.tooltipPos = {
          ...this.recalcTooltipPos(bboxNode.left, bboxNode.top),
        };
      }
    }
    if (changes['pnv'] && this.svg) {
      const ch = changes['pnv'];
      if (ch.currentValue?.values !== ch.previousValue?.values) {
        if (ch.currentValue) {
          this.recalcZScales();
          this.filteredPnv = ch.currentValue.values.size;
        }
        this.redraw();
      }
    }
    if (changes['pnvFilter'] && this.svg && this.pnv) {
      this.filterPnv();
    }
  }

  private initSvg() {
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

    this.svg
      .append('text')
      .text('[μm]')
      .style('font-size', '0.7em')
      .style(
        'transform',
        `translate(${20 - this.margin.left}px, ${30 - this.margin.top}px)`
      );
  }

  private redraw() {
    let circleProcess: anySelection = this.circles.selectAll('path');
    if (this.pnv) {
      circleProcess = circleProcess
        .data(this.nodes.filter((n) => this.pnv.values.has(n.id)))
        .join('path')
        .classed('pnv', true)
        .style('stroke', (n) =>
          this.pnv.period
            ? this.scales.zPeriodic(this.pnv.values.get(n.id) % this.pnv.period)
            : this.scales.z(this.pnv.values.get(n.id))
        );
    } else {
      circleProcess = circleProcess.data(this.nodes).join('path');
    }
    circleProcess
      .classed('node', true)
      .attr('d', (n) => `M${this.displayX(n)},${this.displayY(n)}h0`)
      .attr('data-id', (n) => n.id);
  }

  private filterPnv() {
    this.filteredPnv = 0;
    this.circles
      .selectAll<d3.BaseType, NetworkNode>('.node')
      .classed('hidden', (n: NetworkNode) => {
        const val = this.pnv.values.get(n.id);
        const res = val < this.pnvFilter.from || val > this.pnvFilter.to;
        if (!res) ++this.filteredPnv;
        return res;
      });
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
    if (this.pnv) {
      this.recalcZScales();
    }

    this.axes.bottom.g = this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`);
    this.axes.top.g = this.svg.append('g');
    this.axes.left.g = this.svg.append('g');
    this.axes.right.g = this.svg
      .append('g')
      .attr('transform', `translate(${this.width}, 0)`);
  }

  private recalcZScales() {
    this.scales.z = d3
      .scaleSequential(d3.interpolateWarm)
      .domain([this.pnvExtent.min, this.pnvExtent.max]);
    if (this.pnv.period) {
      this.scales.zPeriodic = d3
        .scaleSequential(d3.interpolateRainbow)
        .domain([0, this.pnv.period]);
    }
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
      .filter(
        (event: MouseEvent) =>
          (!event.ctrlKey || event.type === 'wheel') &&
          !event.button &&
          !event.altKey &&
          !event.shiftKey
      )
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
    let inLinks: Connection[] = [];
    let outLinks: Connection[] = [];
    const set = new Set(this.selectedNodes.map((n) => n.id));
    if (
      this.edgeDir === EdgeDirection.outgoing ||
      this.edgeDir === EdgeDirection.all
    ) {
      outLinks = getOutgoingConnections(this.selectedNodes, this.sheetName);
    }
    if (
      this.edgeDir === EdgeDirection.incoming ||
      this.edgeDir === EdgeDirection.all
    ) {
      inLinks = getIncomingConnections(set, this.sheetName, this.allNodes);
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

  handleMouseEnter(e: MouseEvent) {
    const tgt = e.target as HTMLElement;
    if (tgt.matches('.node')) {
      this.hoveredNode = d3.select(tgt).datum() as any;
      this.hoveredNodeChange.emit(this.hoveredNode);
    } else if (tgt.matches('.link')) {
      this.hoveredEdge = d3.select(tgt).datum() as any;
      this.tooltipPos = {
        ...this.recalcTooltipPos(e.clientX, e.clientY),
      };
    }
  }
  handleMouseLeave(e: MouseEvent) {
    const tgt = e.target as HTMLElement;
    if (tgt.matches('.node')) {
      this.hoveredNode = null;
      this.hoveredNodeChange.emit(null);
    } else if (tgt.matches('.link')) {
      this.hoveredEdge = null;
    }
  }

  private displayX(node: NetworkNode) {
    return this.scales.x(node.sheets[this.sheetName].x);
  }
  private displayY(node: NetworkNode) {
    return this.scales.y(node.sheets[this.sheetName].y);
  }

  private initLasso() {
    const lasso = d3Lasso
      .lasso()
      .closePathSelect(true)
      .closePathDistance(1000)
      .hoverSelect(false)
      .items(this.circles.selectAll('.node') as any)
      .targetArea(
        d3.select(this.container.nativeElement).select<Element>('svg')
      )
      .on('start', () => {
        lasso.items().classed('not-possible', true).classed('selected', false);
      })
      .on('draw', () => {
        lasso
          .possibleItems()
          .classed('not-possible', false)
          .classed('possible', true);
        lasso
          .notPossibleItems()
          .classed('not-possible', true)
          .classed('possible', false);
      })
      .on('end', () => {
        lasso.items().classed('not-possible possible', false);
        this.select.emit([
          ...new Set([...this.selectedNodes, ...lasso.selectedItems().data()]),
        ]);
      });
    d3.select(this.container.nativeElement).select<Element>('svg').call(lasso);
  }

  private recalcTooltipPos(x: number, y: number) {
    const bboxCont = this.container.nativeElement.getBoundingClientRect();
    const pos: Partial<Directional<string>> = {};

    if (x - bboxCont.left < 100) {
      pos.left = x - bboxCont.left + 10 + 'px';
    } else {
      pos.right = bboxCont.width - x + bboxCont.left + 10 + 'px';
    }
    if (y - bboxCont.top < 100) {
      pos.top = y - bboxCont.top + 10 + 'px';
    } else {
      pos.bottom = bboxCont.height - y + bboxCont.top + 10 + 'px';
    }

    return pos;
  }
}
