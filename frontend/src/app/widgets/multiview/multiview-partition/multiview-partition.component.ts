import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';

export type DragEventType = 'start' | 'drag' | 'end';
export interface DragEvent {
  type: DragEventType;
  src: MouseEvent;
}

@Component({
  selector: 'mozaik-multiview-partition',
  templateUrl: './multiview-partition.component.html',
  styleUrls: ['./multiview-partition.component.scss'],
})
export class MultiviewPartitionComponent implements OnInit {
  @ViewChild('content') public content: TemplateRef<any>;
  @Input() data: any;

  constructor() {}

  ngOnInit(): void {}
}
