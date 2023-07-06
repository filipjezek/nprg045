import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Connection, NetworkNode } from 'src/app/store/reducers/model.reducer';
import {
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import {
  getIncomingConnections,
  getOutgoingConnections,
} from 'src/app/utils/network';
import { AnySelection } from 'src/app/utils/svg-ref';
import { NetworkZoomFeatureFactory } from '../../common/network-graph/zoom.feature';
import { LassoFeatureFactory } from '../../common/network-graph/lasso.feature';
import { PNVFeature, PNVFeatureFactory } from './pnv.feature';
import { Extent } from '../../common/scale/scale.component';
import {
  EdgeDirection,
  NetworkGraphComponent,
} from '../../common/network-graph/network-graph.component';

export interface PNVData {
  values: Map<number, number>;
  period: number;
  unit: string;
}

@Component({
  selector: 'mozaik-pnv-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: [
    '../../common/network-graph/network-graph.component.scss',
    './network-graph.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PNVNetworkGraphComponent
  extends NetworkGraphComponent
  implements AfterViewInit, OnChanges, OnInit
{
  @Input() pnv: PNVData = null;
  @Input() pnvFilter: Extent;

  pnvFeature: PNVFeature;

  constructor(
    store: Store<State>,
    changeDetector: ChangeDetectorRef,
    zoomFactory: NetworkZoomFeatureFactory,
    private pnvFactory: PNVFeatureFactory,
    lassoFactory: LassoFeatureFactory
  ) {
    super(store, changeDetector, zoomFactory, lassoFactory);
  }

  override ngAfterViewInit(): void {
    this.initSvg();
    this.initZoom();
    this.lasso = this.lassoFactory.createLassoFeature(this.svg, this.store);
    this.pnvFeature = this.pnvFactory.createPNVFeature(
      this.circles,
      this.nodes,
      this.edges
    );
    if (this.pnv) {
      this.pnvFeature.setData(this.pnv, this.pnvFilter);
    }
    this.redraw();
    if (this.pnv) {
      this.pnvFeature.filterPnv();
      this.pnvFeature.filterEdges();
    }
    this.changeDetector.markForCheck();
    this.subscribeSelection();
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if ((changes['pnv'] || changes['pnvFilter']) && this.svg) {
      this.pnvFeature.setData(this.pnv, this.pnvFilter);
      this.redraw();
      if (!changes['edgeDir'] && this.pnv) this.pnvFeature.filterPnv();
    }
    if (changes['pnv'] || changes['edgeDir']) {
      this.recomputeSelected$.next();
    } else if (changes['pnvFilter']) {
      this.pnvFeature.filterEdges();
    }
  }

  protected override redraw() {
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

  protected override updateEdges(selected: NetworkNode[]) {
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

    this.drawLinks(inLinks, outLinks, set);
    if (this.pnv) {
      this.pnvFeature.filterEdges();
    }
  }

  protected override subscribeSelection() {
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
}
