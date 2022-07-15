import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { FolderInfo } from 'src/app/store/reducers/filesystem.reducer';
import { selectUrlAfterDatastore } from 'src/app/store/selectors/router.selectors';

@Component({
  selector: 'mozaik-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesystemComponent implements OnInit {
  @Input() files: FolderInfo;
  urlRest$ = this.store.select(selectUrlAfterDatastore);

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}
}
