import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as d3 from 'd3';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { State } from 'src/app/store/reducers';
import { AnalogSignalList } from 'src/app/store/reducers/ads.reducer';
import { AnySelection, SVGRef } from 'src/app/utils/svg-ref';
import { LinesZoomFeature, LinesZoomFeatureFactory } from './zoom.feature';
import { NetworkNode } from 'src/app/store/reducers/model.reducer';
import { hoverNode } from 'src/app/store/actions/model.actions';
import { filter, startWith, takeUntil } from 'rxjs';
import { recalcTooltipPos } from '../../common/tooltip/recalc-tooltip-pos';

@Component({
  selector: 'mozaik-lines-graph',
  templateUrl: './lines-graph.component.html',
  styleUrls: ['./lines-graph.component.scss'],
})
export class LinesGraphComponent
  extends UnsubscribingComponent
  implements AfterViewInit, OnChanges
{
  private static instances = 0;
  private id: number;

  @ViewChild('container') container: ElementRef<HTMLDivElement>;
  @Input() ds: AnalogSignalList;

  @Input() selected: NetworkNode[];
  private selectedSet: Set<number>;
  private svg: SVGRef;
  private path: AnySelection;
  private zoom: LinesZoomFeature;
  private line: d3.Line<number>;
  private clipped: AnySelection;
  private delaunay: d3.Delaunay<number>;
  private dot: AnySelection;
  colors = d3.scaleOrdinal<number, string>(d3.schemeTableau10);
  tooltipPos: Partial<Directional<string>> = null;
  tooltip: { x: number; y: number } = { x: 0, y: 0 };

  private hoveredNode$ = this.store.select((s) => s.model.hovered);

  constructor(
    private store: Store<State>,
    private zoomFactory: LinesZoomFeatureFactory,
    private changeDetector: ChangeDetectorRef
  ) {
    super();
    this.id = LinesGraphComponent.instances++;
  }

  ngAfterViewInit(): void {
    this.svg = new SVGRef(this.container.nativeElement, {
      width: 800,
      height: 380,
      margin: {
        left: 40,
        right: 40,
        top: 50,
        bottom: 50,
      },
    });
    this.registerEvents();
    this.initClipPath();
    this.initPath();
    this.subscribeHoveredNode();

    if (this.ds) {
      this.initZoom();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this should happen only once
    if (changes['ds']?.currentValue && this.svg) {
      this.initZoom();
    }
    if (changes['selected']?.currentValue) {
      this.selectedSet = new Set(this.selected.map((n) => n.id));
    }
    if ((changes['ds'] || changes['selected']) && this.ds) {
      this.redraw();
    }
  }

  private initPath() {
    this.path = this.clipped
      .append('g')
      .classed('lines', true)
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');
    this.dot = this.path
      .append('g')
      .append('path')
      .attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')
      .attr('stroke', 'black')
      .style('vector-effect', 'non-scaling-stroke')
      .style('display', 'none');
  }

  private redraw() {
    const selectedIds = this.selected.map((n) => n.id);
    const lineIds = this.ds.ids.filter((id) => this.selectedSet.has(id));
    this.path
      .selectChildren('path')
      .data(
        this.ds.values.filter((_, i) => this.selectedSet.has(this.ds.ids[i]))
      )
      .join('path')
      .style('mix-blend-mode', 'multiply')
      .style('stroke', (_, i) => this.colors(selectedIds.indexOf(lineIds[i])))
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('d', (ys) => this.line.y((y) => this.zoom.transformY(y))(ys));
    this.updateVoronoi();
  }

  private initClipPath() {
    this.svg.el
      .append('clipPath')
      .attr('id', `lines-graph-${this.id}-clip-rect`)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.svg.width)
      .attr('height', this.svg.height);
    this.clipped = this.svg.el
      .append('g')
      .attr('clip-path', `url(#lines-graph-${this.id}-clip-rect)`);
  }

  private updateVoronoi() {
    this.delaunay = d3.Delaunay.from(this.generateVoronoiPoints());
    this.delaunay.voronoi([0, 0, this.svg.width * 128, this.svg.height]);
  }

  private initZoom() {
    this.line = d3.line<number>();
    this.zoom = this.zoomFactory.createZoomFeature(this.ds, this.svg, (t) => {
      this.path.attr('transform', `translate(${t.x}, 0) scale(${t.k}, 1)`);
    });
    this.line.x((_, i) =>
      this.zoom.transformX(this.ds.startTime + i * this.ds.samplingPeriod)
    );
  }

  private *generateVoronoiPoints(): Generator<[number, number]> {
    // the voronoi will be generated zoomed in
    // because we lose accuracy otherwise

    for (let i = 0; i < this.ds.values.length; i++) {
      if (!this.selectedSet.has(this.ds.ids[i])) continue;
      const ys = this.ds.values[i];
      for (let j = 0; j < ys.length; j++) {
        yield [
          this.zoom.transformX(this.ds.startTime + j * this.ds.samplingPeriod) *
            128,
          this.zoom.transformY(ys[j]),
        ];
      }
    }
  }

  private registerEvents() {
    this.svg.rootEl.on('mouseenter', this.onMouseEnter.bind(this));
    this.svg.rootEl.on('mouseleave', this.onMouseLeave.bind(this));
    this.svg.rootEl.on('mousemove', this.onMouseMove.bind(this));
  }

  onMouseEnter() {
    this.path
      .selectChildren('path')
      .style('mix-blend-mode', null)
      .style('opacity', 0.2);
    d3.select(
      (this.dot.style('display', null).node() as Element).parentElement
    ).raise();
  }

  onMouseLeave() {
    this.store.dispatch(hoverNode({ node: null }));
    this.dot.style('display', 'none');
    this.tooltipPos = null;
    this.changeDetector.markForCheck();
  }
  onMouseMove(e: MouseEvent) {
    const coords = d3.pointer(e, this.path.node());
    coords[0] = coords[0] * 128;
    const index = this.delaunay.find(...coords);
    const lineIndex = Math.floor(index / this.ds.values[0].length);
    const lineIds = this.ds.ids.filter((id) => this.selectedSet.has(id));
    const id = lineIds[lineIndex];
    this.store.dispatch(hoverNode({ node: id }));

    this.dot.attr(
      'd',
      `M${this.delaunay.points[index * 2] / 128},${
        this.delaunay.points[index * 2 + 1]
      }h0`
    );
    this.tooltipPos = recalcTooltipPos(
      e.clientX,
      e.clientY,
      this.container.nativeElement
    );
    this.tooltip = {
      x: this.zoom.invertX(coords[0]),
      y: this.zoom.invertY(coords[1]),
    };
    this.changeDetector.markForCheck();
  }

  hoverSwatch(id: number) {
    this.store.dispatch(hoverNode({ node: id }));
  }
  leaveSwatch() {
    this.store.dispatch(hoverNode({ node: null }));
  }

  private subscribeHoveredNode() {
    this.hoveredNode$
      .pipe(
        filter(() => !!this.svg && !!this.ds),
        startWith(null),
        takeUntil(this.onDestroy$)
      )
      .subscribe((n) => {
        if (n && this.selectedSet.has(n.id)) {
          const lineIndex = this.ds.ids
            .filter((id) => this.selectedSet.has(id))
            .indexOf(n.id);
          this.path
            .selectChildren('path')
            .style('opacity', (_, i) => (i == lineIndex ? 1 : 0.2));
        } else {
          this.path
            .selectChildren('path')
            .style('mix-blend-mode', 'multiply')
            .style('opacity', null);
        }
      });
  }
}
