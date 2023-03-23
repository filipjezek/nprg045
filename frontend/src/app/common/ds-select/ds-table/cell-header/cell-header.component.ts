import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { merge, take } from 'rxjs';
import { ColSortService } from '../col-sort.service';

@Component({
  selector: 'mozaik-cell-header',
  templateUrl: './cell-header.component.html',
  styleUrls: ['./cell-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellHeaderComponent implements OnInit {
  sort$ = merge(
    this.colSortS.sortChangedFromCode$,
    this.colSortS.sortChangedFromTemplate$
  );
  @Input() key: string;

  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;

  constructor(private colSortS: ColSortService) {}

  ngOnInit(): void {}

  sortData() {
    this.sort$.pipe(take(1)).subscribe((sort) => {
      this.colSortS.setSortColumn(
        { key: this.key, asc: sort?.key == this.key ? !sort?.asc : true },
        true
      );
    });
  }
}
