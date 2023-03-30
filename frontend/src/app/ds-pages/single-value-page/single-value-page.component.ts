import { Component, OnInit } from '@angular/core';
import { DsPage } from '../ds-page';

@Component({
  selector: 'mozaik-single-value-page',
  templateUrl: './single-value-page.component.html',
  styleUrls: ['./single-value-page.component.scss'],
})
export class SingleValuePageComponent extends DsPage implements OnInit {
  private static instances = 0;
  id = ++SingleValuePageComponent.instances;

  constructor() {
    super();
  }

  ngOnInit(): void {}
}
