import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Connection, NetworkNode } from 'src/app/store/reducers/model.reducer';
import * as d3 from 'd3';
import {
  Subject,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { Store } from '@ngrx/store';
import {
  addSelectedNodes,
  hoverNode,
  selectNodes,
} from 'src/app/store/actions/model.actions';
import { State } from 'src/app/store/reducers';
import {
  getIncomingConnections,
  getOutgoingConnections,
} from 'src/app/utils/network';
import { SVGRef } from 'src/app/utils/svg-ref';
import { ZoomFeature } from './zoom.feature';
import { LassoFeature } from './lasso.feature';
import { PNVFeature } from './pnv.feature';

export type AnySelection = d3.Selection<any, any, any, any>;

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

export interface Extent {
  min: number;
  max: number;
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

  selectedNodes$ = this.store.select((x) => x.model.selected);
  private recomputeSelected$ = new Subject<void>();

  @Input() edgeDir: EdgeDirection;
  @Input() pnv: PNVData = null;
  @Input() pnvFilter: Extent;

  private circles: AnySelection;
  private edges: AnySelection;
  private svg: SVGRef;
  private lasso: LassoFeature;
  private zoom: ZoomFeature;
  private pnvFeature: PNVFeature;

  hoveredEdge: Connection;
  hoveredNode$ = this.store.select((x) => x.model.hovered);
  hoveredNodeVisible = false;
  tooltipPos: Partial<Directional<string>> = { left: '0px', top: '0px' };
  filteredPnv = 0;

  constructor(private store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    this.filteredPnv = this.pnv?.values.size;
    this.subscribeHoveredNode();
  }

  ngAfterViewInit(): void {
    this.initSvg();
    this.initZoom();
    this.lasso = new LassoFeature(this.svg, this.store);
    this.pnvFeature = new PNVFeature(this.circles, this.nodes, this.edges);
    this.redraw();
    this.subscribeSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['pnv'] || changes['pnvFilter']) && this.svg) {
      this.pnvFeature.setData(this.pnv, this.pnvFilter);
      this.redraw();
      if (!changes['edgeDir']) if (this.pnv) this.pnvFeature.filterPnv();
    }
    if (changes['pnv'] || changes['edgeDir']) {
      this.recomputeSelected$.next();
    } else if (changes['pnvFilter']) {
      this.pnvFeature.filterEdges();
    }
  }

  private subscribeHoveredNode() {
    this.hoveredNode$
      .pipe(
        filter(() => !!this.svg),
        startWith(null),
        pairwise(),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([prev, curr]) => {
        this.hoveredNodeVisible = false;
        if (prev) {
          this.circles.select('.hovered').classed('hovered', false);
        }
        if (curr?.sheets[this.sheetName]) {
          const tgt = this.circles
            .select(`[data-id="${curr.id}"]`)
            .classed('hovered', true);
          if (tgt.empty()) return;
          this.hoveredNodeVisible = true;
          const bboxNode = (tgt.node() as HTMLElement).getBoundingClientRect();
          this.tooltipPos = {
            ...this.recalcTooltipPos(bboxNode.left, bboxNode.top),
          };
        }
      });
  }

  private initSvg() {
    this.svg = new SVGRef(this.container.nativeElement, {
      width: 410,
      height: 410,
      margin: {
        left: 60,
        right: 60,
        top: 50,
        bottom: 50,
      },
    });

    const defs = this.svg.el.append('defs');
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
    this.circles = this.svg.el.append('g');
    this.edges = this.circles.append('g');
    this.circles.attr('fill', 'none').attr('stroke-linecap', 'round');

    this.svg.el
      .append('text')
      .text('[μm]')
      .style('font-size', '0.7em')
      .style(
        'transform',
        `translate(${20 - this.svg.margin.left}px, ${
          30 - this.svg.margin.top
        }px)`
      );
  }

  private redraw() {
    let circleProcess: AnySelection;
    if (this.pnv) {
      circleProcess = this.pnvFeature.redraw();
    } else {
      circleProcess = this.circles
        .selectAll('path')
        .data(this.nodes)
        .join('path')
        .style('stroke', null);
    }
    circleProcess
      .classed('node', true)
      .attr(
        'd',
        (n) => `M${this.zoom.transformX(n)},${this.zoom.transformY(n)}h0`
      )
      .attr('data-id', (n) => n.id);
    this.lasso.rebind(circleProcess);
  }

  private initZoom() {
    this.zoom = new ZoomFeature(this.nodes, this.sheetName, this.svg, (t) => {
      this.circles
        .attr('transform', t.toString())
        .attr('stroke-width', 7 / t.k);
      this.edges.attr('stroke-width', 2 / t.k);
    });
  }

  private updateEdges(selected: NetworkNode[]) {
    let inLinks: Connection[] = [];
    let outLinks: Connection[] = [];

    const set = new Set(selected.map((n) => n.id));
    if (
      this.edgeDir === EdgeDirection.outgoing ||
      this.edgeDir === EdgeDirection.all
    ) {
      outLinks = getOutgoingConnections(selected, this.sheetName);
      if (this.pnv)
        outLinks = outLinks.filter((conn) => this.pnv.values.has(conn.to));
    }
    if (
      this.edgeDir === EdgeDirection.incoming ||
      this.edgeDir === EdgeDirection.all
    ) {
      inLinks = this.pnv
        ? getIncomingConnections(
            set,
            this.sheetName,
            this.allNodes.filter((n) => this.pnv.values.has(n.id))
          )
        : getIncomingConnections(set, this.sheetName, this.allNodes);
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
      .attr('x1', (conn) => this.zoom.transformX(this.allNodes[conn.from]))
      .attr('y1', (conn) => this.zoom.transformY(this.allNodes[conn.from]))
      .attr('x2', (conn) => this.zoom.transformX(this.allNodes[conn.to]))
      .attr('y2', (conn) => this.zoom.transformY(this.allNodes[conn.to]));
    if (this.pnv) {
      this.pnvFeature.filterEdges();
    }
  }

  private subscribeSelection() {
    this.selectedNodes$
      .pipe(
        distinctUntilChanged((a, b) => a === b || (!a.length && !b.length)),
        switchMap((x) =>
          this.recomputeSelected$.pipe(
            map(() => x),
            startWith(x)
          )
        ),
        takeUntil(this.onDestroy$)
      )
      .subscribe((selected) => {
        this.updateSelection(
          this.pnv
            ? selected.filter((n) => this.pnv.values.has(n.id))
            : selected
        );
      });
  }

  private updateSelection(selected: NetworkNode[]) {
    this.circles
      .selectAll('.selected, .neighbor')
      .classed('selected neighbor', false);
    this.updateEdges(selected);
    selected.forEach((n) =>
      this.circles.select(`[data-id="${n.id}"]`).classed('selected', true)
    );
  }

  handleClick(e: MouseEvent) {
    const tgt: HTMLElement = e.target as HTMLElement;
    if (tgt.matches('.node')) {
      const id = +tgt.dataset['id'];
      if (e.shiftKey) {
        this.store.dispatch(addSelectedNodes({ nodes: [id] }));
      } else {
        this.store.dispatch(selectNodes({ nodes: [id] }));
      }
    }
  }

  handleMouseEnter(e: MouseEvent) {
    const tgt = e.target as HTMLElement;
    if (tgt.matches('.node')) {
      this.store.dispatch(hoverNode({ node: d3.select(tgt).datum() as any }));
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
      this.store.dispatch(hoverNode({ node: null }));
    } else if (tgt.matches('.link')) {
      this.hoveredEdge = null;
    }
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
