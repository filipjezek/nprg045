import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Legend } from 'src/vendor/d3-color-legend';
import { Directional } from '../network-graph/network-graph.component';

@Component({
  selector: 'mozaik-scale',
  templateUrl: './scale.component.html',
  styleUrls: ['./scale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleComponent implements AfterViewInit, OnChanges {
  @Input() extent: { min: number; max: number };
  @Input() unit: string;
  @Input() periodic: boolean;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  hoveredValue: number = null;
  tooltipPos: Partial<Directional<string>> = {};

  constructor() {}

  ngAfterViewInit(): void {
    this.drawScale();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['extent'] || changes['periodicity']) &&
      this.container?.nativeElement
    ) {
      this.drawScale();
    }
  }

  private drawScale() {
    this.container.nativeElement.innerHTML = '';
    this.container.nativeElement.appendChild(
      Legend(
        d3
          .scaleSequential(
            this.periodic ? d3.interpolateRainbow : d3.interpolateWarm
          )
          .domain([this.extent.min, this.extent.max]),
        { title: this.unit }
      )
    );
  }

  handleMouseLeave(e: MouseEvent) {
    if ((e.target as HTMLElement).matches('svg')) {
      this.hoveredValue = null;
    }
  }

  handleMouseMove(e: MouseEvent) {
    const bboxCont = this.container.nativeElement.getBoundingClientRect();
    this.tooltipPos = {};
    this.hoveredValue =
      ((this.extent.max - this.extent.min) * (e.clientX - bboxCont.left)) /
        bboxCont.width +
      this.extent.min;

    if (e.clientX - bboxCont.left < 60) {
      this.tooltipPos.left = e.clientX - bboxCont.left + 'px';
    } else {
      this.tooltipPos.right = bboxCont.width - e.clientX + bboxCont.left + 'px';
    }
  }
}
