import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mozaik-datastore',
  templateUrl: './datastore.component.html',
  styleUrls: ['./datastore.component.scss'],
})
export class DatastoreComponent implements OnInit {
  @HostBinding('class.selected') @Input() selected = false;
  @Input() name: string;

  faDatabase = faDatabase;

  constructor() {}

  ngOnInit(): void {}
}
