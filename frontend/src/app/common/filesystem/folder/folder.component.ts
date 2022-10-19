import { transition, trigger, useAnimation } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  faChevronRight,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { dialogClose, dialogOpen } from 'src/app/animations';
import {
  loadDirectory,
  toggleDirectory,
} from 'src/app/store/actions/filesystem.actions';
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
  private _info: FolderInfo | string = undefined;
  @Input() get info() {
    return this._info;
  }
  set info(val) {
    if (this._info != val) {
      this.loading = false;
      this._info = val;
    }
  }

  private _context = '';
  extContext = '';
  @Input() get context() {
    return this._context;
  }
  set context(ctx) {
    this._context = ctx;
    this.extContext =
      this.context == '/' ? '/' : this.context && this.context + '/';
  }

  loading = false;

  faChevronRight = faChevronRight;
  faCircleNotch = faCircleNotch;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}

  isString(val: string | FolderInfo): val is string {
    return typeof val == 'string';
  }

  cast(val: string | FolderInfo): FolderInfo {
    return val as FolderInfo;
  }

  toggleFolder() {
    if (this.isString(this.info)) {
      this.refresh();
    } else {
      this.store.dispatch(
        toggleDirectory({
          open: !this.info.open,
          path: this.extContext + this.info.name,
        })
      );
    }
  }

  refresh() {
    this.loading = true;
    this.store.dispatch(
      loadDirectory({
        path:
          this.extContext +
          (typeof this.info == 'string' ? this.info : this.info.name),
      })
    );
  }

  trackByName(index: number, folder: FolderInfo | string) {
    return typeof folder == 'string' ? folder : folder.name;
  }
}
