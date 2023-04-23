import { transition, trigger, useAnimation } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { dialogClose, dialogOpen } from 'src/app/animations';

@Component({
  selector: 'mozaik-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  animations: [
    trigger('collapse', [
      transition(':enter', useAnimation(dialogOpen)),
      transition(':leave', useAnimation(dialogClose)),
    ]),
  ],
})
export class CollapsibleComponent implements OnInit {
  @Output() openChange = new EventEmitter<boolean>();
  @Input() open = false;
  faChevronRight = faChevronRight;

  constructor() {}

  ngOnInit(): void {}
}
