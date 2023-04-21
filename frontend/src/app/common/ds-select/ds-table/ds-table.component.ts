import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { isEqual, uniqWith } from 'lodash-es';
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

export enum ColType {
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
export class DsTableComponent implements OnInit, OnChanges {
  @Input() rowHeight: number = 47;
  @Input() src: any[][] = [];
  @Input() keys: string[] = [];

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
  enumValues: Record<string, any[]>;

  clampRowsControl = new FormControl<boolean>(true);
  pageSizeControl = new FormControl<number>(20, { updateOn: 'blur' });
  page = 1;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('src' in changes) {
      const change = changes['src'];
      if (!change.currentValue?.length) {
        this.colSchema = {};
        this.colSizes = [];
        return;
      }
      if (change.currentValue === change.previousValue) return;

      this.computeEnumValues(change.currentValue);
      const schema = this.getSchema(this.keys, this.enumValues);
      if (!isEqual(schema, this.colSchema)) {
        const length = this.keys.length;
        this.colSizes = Array(length).fill(100 / length);
        this.colSchema = schema;
        this.page = 1;
      } else if (change.currentValue.length != change.previousValue.length) {
        this.page = 1;
      }
    }
  }

  ngOnInit(): void {}

  private getSchema(keys: string[], distinctValues: Record<string, any[]>) {
    const schema: Record<string, ColType> = {};
    keys.forEach((key) => {
      if (!distinctValues[key]) return;
      for (const val of distinctValues[key]) {
        if (val !== null && val !== undefined) {
          schema[key] = getColType(val);
          return;
        }
      }
      schema[key] = ColType.object;
    });
    return schema;
  }

  private computeEnumValues(values: any[][]) {
    this.enumValues = {};
    if (!values.length) return;

    this.keys.forEach((key, i) => {
      this.enumValues[key] = uniqWith(
        values.map((row) => row[i]),
        isEqual
      );
      if (
        typeof this.enumValues[key].find(
          (x) => x !== null && x !== undefined
        ) == 'number'
      ) {
        this.enumValues[key].sort((a, b) => a - b);
      } else {
        this.enumValues[key].sort();
      }
    });
  }

  ceil(num: number) {
    return Math.ceil(num);
  }

  getInjector(value: any, parent: Injector) {
    return Injector.create({
      providers: [{ provide: DSCELL_VAL, useValue: value }],
      parent,
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

export function getColType(value: any) {
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
  if (value === null) {
    return ColType.object;
  }
  if (Object.values(value).every((val) => isPrimitive(val))) {
    return ColType.keyvalue;
  }
  return ColType.object;
}
