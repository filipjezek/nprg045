import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AnySelection, SVGRef } from 'src/app/utils/svg-ref';
import { Extent, defaultScale } from '../../common/scale/scale.component';
import * as d3 from 'd3';
import { MatrixZoomFeature, MatrixZoomFeatureFactory } from './zoom.feature';
import { fromEvent } from 'rxjs';

export interface MatrixData {
  ids: number[];
  values: number[][];
}

@Component({
  selector: 'mozaik-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent implements OnChanges, AfterViewInit {
  @Input() matrix: MatrixData;
  @Input() filter: Extent = {
    min: -1,
    max: 1,
  };
  @Input() periodic: boolean;
  @Input() unit: string;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;
  @ViewChild('canv') canv: ElementRef<HTMLCanvasElement>;

  private svg: SVGRef;
  private image: AnySelection;
  private clipped: AnySelection;
  private crosshair: AnySelection;
  private zoom: MatrixZoomFeature;
  private ctx: CanvasRenderingContext2D;
  tooltipPos: Partial<Directional<string>>;

  x: number;
  y: number;
  z: number;

  constructor(private zoomFactory: MatrixZoomFeatureFactory) {}

  ngAfterViewInit(): void {
    this.ctx = this.canv.nativeElement.getContext('2d');
    this.svg = new SVGRef(this.container.nativeElement, {
      width: 610,
      height: 610,
      margin: {
        left: 50,
        right: 50,
        top: 50,
        bottom: 50,
      },
    });
    this.initImage();
    this.initCrosshair();

    if (this.matrix) {
      this.redraw();
      this.initZoom();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.svg && this.matrix) {
      this.redraw();
    }
    // this should happen only once
    if (changes['matrix']?.currentValue && this.svg) {
      this.initZoom();
    }
  }

  private redraw() {
    this.createImage();
    this.image.attr('href', this.canv.nativeElement.toDataURL());
  }

  private initImage() {
    this.svg.el
      .append('clipPath')
      .attr('id', 'clip-rect')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.svg.width)
      .attr('height', this.svg.height);

    this.clipped = this.svg.el.append('g').attr('clip-path', 'url(#clip-rect)');
    this.image = this.clipped
      .append('image')
      .attr('image-rendering', 'crisp-edges')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.svg.width)
      .attr('height', this.svg.height);
  }

  private createImage() {
    const len = this.matrix.ids.length;
    this.canv.nativeElement.width = len;
    this.canv.nativeElement.height = len;
    const scale = d3
      .scaleSequential(defaultScale(this.periodic))
      .domain([this.filter.min, this.filter.max]);
    this.ctx.clearRect(0, 0, len, len);

    for (let x = 0; x < len; x++) {
      for (let y = 0; y < len; y++) {
        const el = this.matrix.values[y][x];
        if (el >= this.filter.min && el <= this.filter.max) {
          this.ctx.fillStyle = scale(el);
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private initZoom() {
    this.zoom = this.zoomFactory.createZoomFeature(
      this.matrix.ids,
      this.svg,
      (t) => {
        this.image.attr('transform', t.toString());
      }
    );
  }

  private initCrosshair() {
    this.crosshair = this.clipped.append('g').classed('crosshair', true);
    this.crosshair
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 1)
      .attr('width', this.svg.width);
    this.crosshair
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', this.svg.height)
      .attr('width', 1);
  }

  handleMouseMove(e: MouseEvent) {
    let bbox = (this.image.node() as SVGElement).getBoundingClientRect();
    const pixelSize = bbox.width / this.matrix.ids.length;
    const xI = Math.floor((e.clientX - bbox.left) / pixelSize);
    const yI = Math.floor((e.clientY - bbox.top) / pixelSize);
    this.x = this.matrix.ids[xI];
    this.y = this.matrix.ids[yI];

    if (this.x !== undefined && this.y !== undefined) {
      this.z = this.matrix.values[yI][xI];
      this.tooltipPos = this.recalcTooltipPos(e.clientX, e.clientY);
    }

    bbox = this.container.nativeElement.getBoundingClientRect();
    this.crosshair
      .select('rect:first-child')
      .attr('y', e.clientY - bbox.top + 3 - this.svg.margin.top);
    this.crosshair
      .select('rect:last-child')
      .attr('x', e.clientX - bbox.left + 5 - this.svg.margin.left);
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
