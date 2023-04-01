import { Component, Input, OnInit } from '@angular/core';
import { colorFromString } from 'src/app/utils/color-from-string';

@Component({
  selector: 'mozaik-property-bag',
  templateUrl: './property-bag.component.html',
  styleUrls: ['./property-bag.component.scss'],
})
export class PropertyBagComponent implements OnInit {
  @Input() value: any;
  colorFromString = colorFromString;

  constructor() {}

  ngOnInit(): void {}
}
