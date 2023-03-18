import { Component, Input, OnInit } from '@angular/core';
import { isEqual } from 'lodash-es';

enum ColType {
  string,
  number,
  object,
  array,
  boolean,
  link,
  keyvalue,
}

@Component({
  selector: 'mozaik-ds-table',
  templateUrl: './ds-table.component.html',
  styleUrls: ['./ds-table.component.scss'],
})
export class DsTableComponent implements OnInit {
  @Input() get src(): Record<string, any>[] {
    return this._src;
  }
  set src(val) {
    if (!val || !val.length) {
      this._src = val;
      this.colSchema = {};
      this.colSizes = [];
      return;
    }
    const keys = Object.keys(val[0]);
    const schema = this.getSchema(keys, val);
    if (!isEqual(schema, this.colSchema)) {
      const length = keys.length;
      this.colSizes = Array(length).fill(100 / length);
      this.colSchema = schema;
    }
    this._src = val;
  }
  @Input() rowHeight: number = 40;

  colSizes: number[] = [];
  colSchema: Record<string, ColType>;

  private _src: Record<string, any>[] = [];
  ColType = ColType;

  constructor() {}

  ngOnInit(): void {}

  private isPrimitive(value: any) {
    return !value || ['number', 'string', 'boolean'].includes(typeof value);
  }

  private getColType(value: any) {
    switch (typeof value) {
      case 'boolean':
        return ColType.boolean;
      case 'number':
        return ColType.number;
      case 'string':
        return ColType.string;
      default:
        break;
    }
    if (value instanceof Array) {
      return ColType.array;
    }
    if (Object.values(value).every((val) => this.isPrimitive(val))) {
      return ColType.keyvalue;
    }
    return ColType.object;
  }

  private getSchema(keys: string[], values: Record<string, any>[]) {
    const notFound = new Set(keys);
    const schema: Record<string, ColType> = {};
    for (let i = 0; i < values.length && notFound.size; ++i) {
      notFound.forEach((key) => {
        if (values[i][key] !== null) {
          schema[key] = this.getColType(values[i][key]);
          notFound.delete(key);
        }
      });
    }
    notFound.forEach((key) => (schema[key] = ColType.object));
    return schema;
  }
}
