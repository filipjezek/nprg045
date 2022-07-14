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
import { selectDatastore } from 'src/app/store/actions/filesystem.actions';
import { State } from 'src/app/store/reducers';
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

  current$ = this.store.select((x) => x.fs.selectedDatastore);
  faChevronRight = faChevronRight;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}

  selectDatastore(path: string) {
    this.store.dispatch(selectDatastore({ path }));
  }
}
