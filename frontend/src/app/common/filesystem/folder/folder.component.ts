import { transition, trigger, useAnimation } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { dialogClose, dialogOpen } from 'src/app/animations';
import { State } from 'src/app/store/reducers';
import { FolderInfo } from 'src/app/store/reducers/filesystem.reducer';
import { selectUrlAfterDatastore } from 'src/app/store/selectors/router.selectors';

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
  urlRest$ = this.store.select(selectUrlAfterDatastore);

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}
}
