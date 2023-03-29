import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mozaik-single-value-page',
  templateUrl: './single-value-page.component.html',
  styleUrls: ['./single-value-page.component.scss'],
})
export class SingleValuePageComponent implements OnInit {
  private static instances = 0;
  id = ++SingleValuePageComponent.instances;

  constructor() {}

  ngOnInit(): void {}
}
