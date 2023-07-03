// based on the following:
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/histogram

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SVGRef } from 'src/app/utils/svg-ref';
import * as d3 from 'd3';
import { Extent, defaultScale } from '../scale/scale.component';

type Scales = {
  scaleX: d3.ScaleLinear<number, number>;
  scaleY: d3.ScaleLinear<number, number>;
};

export interface HistogramData {
  unit: string;
  period: number;
  values: number[];
}

@Component({
  selector: 'mozaik-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, AfterViewInit, OnChanges {
  private static instances = 0;
  private id: number;

  @ViewChild('container') container: ElementRef<HTMLDivElement>;
  @Input() pnv: HistogramData;
  @Input() extent: Extent;
  @Input() thresholds: number | d3.ThresholdCountGenerator<number>;

  private svg: SVGRef;
  private format = d3.format('.2');

  constructor() {
    this.id = HistogramComponent.instances++;
  }

  ngAfterViewInit(): void {
    this.svg = new SVGRef(this.container.nativeElement, {
      width: 610,
      height: 410,
      margin: {
        left: 60,
        right: 60,
        top: 50,
        bottom: 50,
      },
    });
    if (this.pnv) {
      this.redraw();
    }
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.svg) {
      this.redraw();
    }
  }

  private calculate() {
    const bins = d3.bin().thresholds(this.thresholds)(this.pnv.values);
    const median = d3.median(this.pnv.values);
    const mean = d3.mean(this.pnv.values);
    return {
      bins,
      median,
      mean,
    };
  }

  private createScales(bins: d3.Bin<number, number>[]) {
    const scaleX = d3
      .scaleLinear()
      .domain([bins[0].x0, bins[bins.length - 1].x1])
      .range([0, this.svg.width]);
    const scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (bin) => bin.length)])
      .nice()
      .range([this.svg.height, 0]);
    return { scaleX, scaleY };
  }

  private drawAxes({ scaleX, scaleY }: Scales) {
    const xAxis = d3.axisBottom(scaleX).tickSizeOuter(0);
    const yAxis = d3.axisLeft(scaleY);

    this.svg.el
      .append('g')
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', this.svg.width)
          .attr('stroke-opacity', 0.1)
      )
      .call((g) =>
        g
          .append('text')
          .attr('x', 10 - this.svg.margin.left)
          .attr('y', 20 - this.svg.margin.top)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text('frequency')
      );
    this.svg.el
      .append('g')
      .attr('transform', `translate(0, ${this.svg.height})`)
      .call(xAxis)
      .call((g) =>
        g
          .append('text')
          .attr('x', this.svg.width - 10)
          .attr('y', this.svg.margin.bottom - 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text(`[${this.pnv.unit}]`)
      );
  }

  private drawBins(bins: d3.Bin<number, number>[], { scaleX, scaleY }: Scales) {
    const interpolate = this.pnv.period
      ? d3.scaleSequential(defaultScale(true)).domain([0, this.pnv.period])
      : d3
          .scaleSequential(defaultScale(false))
          .domain([this.extent.min, this.extent.max]);

    this.svg.el
      .append('g')
      .selectAll('linearGradient')
      .data(bins)
      .join('linearGradient')
      .attr('id', (d, i) => `grad-${this.id}-${i}`)
      .call((grad) =>
        grad
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', (d) => interpolate(d.x0))
      )
      .call((grad) =>
        grad
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', (d) => interpolate(d.x1))
      );
    this.svg.el
      .append('g')
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', (d) => scaleX(d.x0) + 1)
      .attr('width', (d) => Math.max(0, scaleX(d.x1) - scaleX(d.x0) - 2))
      .attr('y', (d) => scaleY(d.length))
      .attr('height', (d) => scaleY(0) - scaleY(d.length))
      .attr('fill', (d, i) => `url(#grad-${this.id}-${i})`)
      .append('title')
      .text(
        (d) =>
          `${d.x0} ≤ x < ${d.x1}\n${d.length} (${this.format(
            (d.length * 100) / this.pnv.values.length
          )}%)`
      );
  }

  private redraw() {
    this.svg.el.selectChildren().remove();
    const { bins, median, mean } = this.calculate();
    const scales = this.createScales(bins);
    this.drawAxes(scales);
    this.drawBins(bins, scales);
    this.drawStatistics(mean, median, scales);
  }

  private drawStatistics(mean: number, median: number, { scaleX }: Scales) {
    this.svg.el
      .append('line')
      .attr('x1', scaleX(mean))
      .attr('x2', scaleX(mean))
      .attr('y1', -25)
      .attr('y2', this.svg.height)
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 2px white)');
    this.svg.el
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', scaleX(mean))
      .attr('y', 20 - this.svg.margin.top)
      .text(`mean = ${this.format(mean)}`)
      .attr('stroke', 'red')
      .attr('font-size', 12);

    this.svg.el
      .append('line')
      .attr('x1', scaleX(median))
      .attr('x2', scaleX(median))
      .attr('y1', -10)
      .attr('y2', this.svg.height)
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 2px white)');
    this.svg.el
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', scaleX(median))
      .attr('y', 35 - this.svg.margin.top)
      .text(`median = ${this.format(median)}`)
      .attr('stroke', 'blue')
      .attr('font-size', 12);
  }
}
