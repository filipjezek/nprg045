import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  faFilter,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { merge, take } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { ColType } from '../ds-table.component';
import { FilterDialogComponent } from '../filters/filter-dialog/filter-dialog.component';
import { State } from 'src/app/store/reducers';
import { selectOrderColumn } from 'src/app/store/selectors/navigator.selectors';
import { Store } from '@ngrx/store';
import {
  addCondition,
  sortByColumn,
} from 'src/app/store/actions/navigator.actions';

@Component({
  selector: 'mozaik-cell-header',
  templateUrl: './cell-header.component.html',
  styleUrls: ['./cell-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellHeaderComponent implements OnInit {
  ColType = ColType;

  sort$ = this.store.select(selectOrderColumn);
  @Input() key: string;
  @Input() type: ColType;

  @Input() distinctValues: any[];

  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  faFilter = faFilter;

  constructor(private store: Store<State>, private dialogS: DialogService) {}

  ngOnInit(): void {}

  sortData() {
    this.sort$.pipe(take(1)).subscribe((sort) => {
      this.store.dispatch(
        sortByColumn({
          key: this.key,
          asc: sort?.key == this.key ? !sort?.asc : true,
        })
      );
    });
  }

  filterData() {
    const ref = this.dialogS.openUnattached(FilterDialogComponent);
    ref.type = this.type;
    ref.distinctValues = this.distinctValues;
    ref.key = this.key;
    ref.attach();

    ref.addEventListener('close', () => this.dialogS.close());
    ref.addEventListener('value', (e) => {
      this.dialogS.close();
      this.store.dispatch(
        addCondition({
          condition: (e as CustomEvent<string>).detail,
          key: this.key,
        })
      );
    });
  }
}
