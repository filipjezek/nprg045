import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isEqual } from 'lodash-es';
import { isPrimitive } from 'src/app/utils/is-primitive';
import { LinkWrapper } from '../sql/user-sql-functions/make-link';
import {
  CellGenericComponent,
  DSCell,
  DSCELL_VAL,
} from './cell-generic/cell-generic.component';
import { CellKeyvalueComponent } from './cell-keyvalue/cell-keyvalue.component';
import { CellLinkComponent } from './cell-link/cell-link.component';
import { CellListComponent } from './cell-list/cell-list.component';
import { CellObjectComponent } from './cell-object/cell-object.component';

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
  @Input() rowHeight: number = 45;
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
      this.page = 1;
    } else if (val.length != this._src.length) {
      this.page = 1;
    }
    this._src = val;
  }
  private _src: Record<string, any>[] = [];

  colSizes: number[] = [];
  colSchema: Record<string, ColType>;
  ColType = ColType;
  cellTypes: Record<ColType, new (...args: any) => DSCell<any>> = {
    [ColType.array]: CellListComponent,
    [ColType.boolean]: CellGenericComponent,
    [ColType.keyvalue]: CellKeyvalueComponent,
    [ColType.link]: CellLinkComponent,
    [ColType.number]: CellGenericComponent,
    [ColType.object]: CellObjectComponent,
    [ColType.string]: CellGenericComponent,
  };

  clampRowsControl = new FormControl<boolean>(false);
  pageSizeControl = new FormControl<number>(20, { updateOn: 'blur' });
  page = 1;

  constructor() {}

  ngOnInit(): void {}

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
    if (value instanceof LinkWrapper) {
      return ColType.link;
    }
    if (Object.values(value).every((val) => isPrimitive(val))) {
      return ColType.keyvalue;
    }
    return ColType.object;
  }

  private getSchema(keys: string[], values: Record<string, any>[]) {
    const notFound = new Set(keys);
    const schema: Record<string, ColType> = {};
    for (let i = 0; i < values.length && notFound.size; ++i) {
      notFound.forEach((key) => {
        if (values[i][key] !== null && values[i][key] !== undefined) {
          schema[key] = this.getColType(values[i][key]);
          notFound.delete(key);
        }
      });
    }
    notFound.forEach((key) => (schema[key] = ColType.object));
    return schema;
  }

  ceil(num: number) {
    return Math.ceil(num);
  }

  getInjector(value: any) {
    return Injector.create({
      providers: [{ provide: DSCELL_VAL, useValue: value }],
    });
  }

  isEmpty(val: any) {
    return (
      val === null ||
      val === '' ||
      val === undefined ||
      isEqual(val, []) ||
      isEqual(val, {})
    );
  }
}
