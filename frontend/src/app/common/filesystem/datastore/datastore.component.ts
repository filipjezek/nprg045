import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mozaik-datastore',
  templateUrl: './datastore.component.html',
  styleUrls: ['./datastore.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatastoreComponent implements OnInit {
  @Input() name: string;
  @Input() link: string | any[];

  faDatabase = faDatabase;

  constructor() {}

  ngOnInit(): void {}
}
