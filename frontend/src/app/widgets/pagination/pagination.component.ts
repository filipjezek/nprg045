import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mozaik-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input() baseUrl: string;
  @Input() urlParams: { [key: string]: number | string } = {};
  @Input() baseParam: string;

  @Output() paginate = new EventEmitter<number>();

  @Input() set current(c: number) {
    this._current = c;
    this.redraw();
  }
  get current(): number {
    return this._current;
  }
  private _current: number;

  @Input() set max(m: number) {
    this._max = m;
    this.redraw();
  }
  get max(): number {
    return this._max;
  }
  private _max: number;

  links: number[] = [];

  constructor() {}

  ngOnInit() {
    this.redraw();
  }

  private redraw() {
    this.links = [this.current];
    let i = 1,
      pass = true;
    while (this.links.length < 5 && pass) {
      pass = false;
      if (i < this.current) {
        this.links.unshift(this.current - i);
        pass = true;
      }
      if (this.current + i <= this.max) {
        this.links.push(this.current + i);
        pass = true;
      }
      i++;
    }
  }

  setParam(value?: string | number) {
    const res = { ...this.urlParams };
    if (value === null || value === undefined) {
      delete res[this.baseParam];
    } else {
      res[this.baseParam] = value;
    }
    return res;
  }

  onNavigate(e: number) {
    this.paginate.next(e);
  }
}
