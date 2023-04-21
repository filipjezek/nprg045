import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColType } from '../../../ds-table.component';

@Component({
  selector: 'mozaik-filter-switch',
  templateUrl: './filter-switch.component.html',
  styleUrls: ['./filter-switch.component.scss'],
})
export class FilterSwitchComponent implements OnInit {
  @Input() control: FormControl;
  @Input() key: string;
  @Input() path = '';
  @Input() distinctValues: any[];
  @Input() type: ColType;

  ColType = ColType;

  constructor() {}

  ngOnInit(): void {}
}
