import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { convertToParamMap, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { LinkWrapper } from '../../sql/user-sql-functions/make-link';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';

@Component({
  selector: 'mozaik-cell-link',
  templateUrl: './cell-link.component.html',
  styleUrls: ['./cell-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellLinkComponent implements OnInit, DSCell<LinkWrapper> {
  params$ = this.store.select(routerSelectors.selectRouteParams).pipe(
    map((params) => {
      const ready = params['ready'] ? params['ready'].split(',') : [];
      let viewing = params['viewing'] ? params['viewing'].split(',') : [];
      const index = this.value.index + '';

      if (!ready.includes(index)) {
        ready.push(index);
      }
      if (!viewing.includes(index)) {
        viewing = [index];
      }

      const copy: Params = { ...params, ready, viewing };
      delete copy['path'];
      return copy;
    })
  );

  path$ = this.store.select(routerSelectors.selectRouteParam('path'));

  constructor(
    @Inject(DSCELL_VAL) public value: LinkWrapper,
    private store: Store<State>
  ) {}

  ngOnInit(): void {}
}
