import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { convertToParamMap, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, withLatestFrom } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { LinkWrapper } from '../../sql/user-sql-functions/make-link';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';

export function addTabToParams(index: number, params: Params, view = true) {
  const ready = params['ready'] ? params['ready'].split(',') : [];
  let viewing = params['viewing'] ? params['viewing'].split(',') : [];
  const strIndex = index + '';

  if (!ready.includes(strIndex)) {
    ready.push(strIndex);
  }
  if (view && !viewing.includes(strIndex)) {
    viewing = [strIndex];
  }

  const copy: Params = { ...params, ready, viewing };
  delete copy['path'];
  return copy;
}

@Component({
  selector: 'mozaik-cell-link',
  templateUrl: './cell-link.component.html',
  styleUrls: ['./cell-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellLinkComponent implements OnInit, DSCell<LinkWrapper> {
  params$ = this.store
    .select(routerSelectors.selectRouteParams)
    .pipe(map((params) => addTabToParams(this.value.index, params)));

  path$ = this.store.select(routerSelectors.selectRouteParam('path'));

  constructor(
    @Inject(DSCELL_VAL) public value: LinkWrapper,
    private store: Store<State>,
    private router: Router
  ) {}

  ngOnInit(): void {}

  middleClick(e: MouseEvent) {
    if (e.button == 1) {
      e.preventDefault();
      this.path$
        .pipe(
          withLatestFrom(this.store.select(routerSelectors.selectRouteParams)),
          take(1)
        )
        .subscribe(([path, params]) => {
          this.router.navigate([
            'datastore',
            path,
            'inspect',
            addTabToParams(this.value.index, params, false),
          ]);
        });
    }
  }
}
