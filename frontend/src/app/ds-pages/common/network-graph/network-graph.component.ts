import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injectable,
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
import { AnySelection, SVGRef } from 'src/app/utils/svg-ref';
import {
  NetworkZoomFeature,
  NetworkZoomFeatureFactory,
} from '../../common/network-graph/zoom.feature';
import {
  LassoFeature,
  LassoFeatureFactory,
} from '../../common/network-graph/lasso.feature';
import { recalcTooltipPos } from '../tooltip/recalc-tooltip-pos';

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
export class NetworkGraphComponent
  extends UnsubscribingComponent
  implements AfterViewInit, OnChanges, OnInit
{
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  @Input() nodes: NetworkNode[];
  @Input() sheetName: string;
  @Input() allNodes: NetworkNode[];

  selectedNodes$ = this.store.select((x) => x.model.selected);
  protected recomputeSelected$ = new Subject<void>();

  @Input() showArrows = true;
  @Input() highTransparency = false;
  @Input() edgeDir: EdgeDirection;

  protected circles: AnySelection;
  protected edges: AnySelection;
  protected svg: SVGRef;
  protected lasso: LassoFeature;
  protected zoom: NetworkZoomFeature;

  hoveredEdge: Connection;
  hoveredNode$ = this.store.select((x) => x.model.hovered);
  hoveredNodeVisible = false;
  tooltipPos: Partial<Directional<string>> = { left: '0px', top: '0px' };

  constructor(
    protected store: Store<State>,
    protected changeDetector: ChangeDetectorRef,
    protected zoomFactory: NetworkZoomFeatureFactory,
    protected lassoFactory: LassoFeatureFactory
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeHoveredNode();
  }

  ngAfterViewInit(): void {
    this.initSvg();
    this.initZoom();
    this.lasso = this.lassoFactory.createLassoFeature(this.svg, this.store);
    this.redraw();
    this.changeDetector.markForCheck();
    this.subscribeSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['edgeDir']) {
      this.recomputeSelected$.next();
    }
  }

  protected subscribeHoveredNode() {
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
            ...recalcTooltipPos(
              bboxNode.left,
              bboxNode.top,
              this.container.nativeElement
            ),
          };
        }
      });
  }

  protected initSvg() {
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

  protected redraw() {
    const circleProcess = this.circles
      .selectAll('path')
      .data(this.nodes)
      .join('path')
      .style('stroke', null)
      .classed('node', true)
      .attr(
        'd',
        (n) => `M${this.zoom.transformX(n)},${this.zoom.transformY(n)}h0`
      )
      .attr('data-id', (n) => n.id);
    this.lasso.rebind(circleProcess);
  }

  protected initZoom() {
    this.zoom = this.zoomFactory.createZoomFeature(
      this.nodes,
      this.sheetName,
      this.svg,
      (t) => {
        this.circles
          .attr('transform', t.toString())
          .attr('stroke-width', 7 / t.k);
        this.edges.attr('stroke-width', 2 / t.k);
      }
    );
  }

  protected updateEdges(selected: NetworkNode[]) {
    let inLinks: Connection[] = [];
    let outLinks: Connection[] = [];

    const set = new Set(selected.map((n) => n.id));
    if (
      this.edgeDir === EdgeDirection.outgoing ||
      this.edgeDir === EdgeDirection.all
    ) {
      outLinks = getOutgoingConnections(selected, this.sheetName);
    }
    if (
      this.edgeDir === EdgeDirection.incoming ||
      this.edgeDir === EdgeDirection.all
    ) {
      inLinks = getIncomingConnections(set, this.sheetName, this.allNodes);
      this.drawLinks(inLinks, outLinks, set);
    }
  }

  protected drawLinks(
    inLinks: Connection[],
    outLinks: Connection[],
    selected: Set<number>
  ) {
    inLinks.filter((conn) => {
      const c = this.circles
        .select(`[data-id="${conn.from}"]`)
        .classed('neighbor', true);
      return !!c.node();
    });
    outLinks.filter((conn) => {
      const c = this.circles
        .select(`[data-id="${conn.to}"]`)
        .classed('neighbor', true);
      return !!c.node();
    });

    this.edges
      .selectAll('.link')
      .data([...inLinks, ...outLinks])
      .join(
        (enter) => enter.append('line').classed('link', true),
        (update) => update,
        (exit) => exit.remove()
      )
      .classed('incoming', (conn) => selected.has(conn.to))
      .classed('outgoing', (conn) => selected.has(conn.from))
      .attr(
        'marker-end',
        (conn) =>
          `url(#arrowhead${selected.has(conn.to) ? '-incoming' : ''}${
            selected.has(conn.from) ? '-outgoing' : ''
          })`
      )
      .attr('x1', (conn) => this.zoom.transformX(this.allNodes[conn.from]))
      .attr('y1', (conn) => this.zoom.transformY(this.allNodes[conn.from]))
      .attr('x2', (conn) => this.zoom.transformX(this.allNodes[conn.to]))
      .attr('y2', (conn) => this.zoom.transformY(this.allNodes[conn.to]));
  }

  protected subscribeSelection() {
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
        this.updateSelection(selected);
      });
  }

  protected updateSelection(selected: NetworkNode[]) {
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
        ...recalcTooltipPos(e.clientX, e.clientY, this.container.nativeElement),
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
}
