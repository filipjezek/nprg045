import { transition, trigger, useAnimation } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { dialogClose, dialogOpen } from 'src/app/animations';
import { FolderInfo } from 'src/app/store/reducers/filesystem.reducer';

@Component({
  selector: 'mozaik-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('folder', [
      transition(':enter', useAnimation(dialogOpen)),
      transition(':leave', useAnimation(dialogClose)),
    ]),
  ],
})
export class FolderComponent implements OnInit {
  @Input() info: FolderInfo;
  @Input() open = false;
  @Input() context = '';

  faChevronRight = faChevronRight;

  constructor() {}

  ngOnInit(): void {}
}
