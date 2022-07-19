import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FolderInfo } from 'src/app/store/reducers/filesystem.reducer';

@Component({
  selector: 'mozaik-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesystemComponent implements OnInit {
  @Input() files: FolderInfo;

  constructor() {}

  ngOnInit(): void {}
}
