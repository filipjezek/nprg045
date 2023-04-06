import { Component, Input, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, withLatestFrom } from 'rxjs';
import { State } from 'src/app/store/reducers';
import { Ads } from 'src/app/store/reducers/ads.reducer';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';

@Component({
  selector: 'mozaik-ds-tab-handle',
  templateUrl: './ds-tab-handle.component.html',
  styleUrls: ['./ds-tab-handle.component.scss'],
})
export class DsTabHandleComponent implements OnInit {
  @Input() ds: Partial<Ads> & { index: number };
  @Input() viewing: boolean;
  @Input() ignoreClick = false;

  params$ = this.store.select(routerSelectors.selectRouteParams).pipe(
    map((params) => {
      const ready: string[] = params['ready'] ? params['ready'].split(',') : [];
      let viewing: string[] = params['viewing']
        ? params['viewing'].split(',')
        : [];
      const strIndex = this.ds.index + '';

      if (!viewing.includes(strIndex)) {
        viewing = [strIndex];
      }
      const copy: Params = { ...params, ready, viewing };
      delete copy['path'];
      return copy;
    })
  );
  path$ = this.store.select(routerSelectors.selectRouteParam('path'));

  constructor(private store: Store<State>, private router: Router) {}

  ngOnInit(): void {}

  viewTab() {
    if (this.ignoreClick) return;
    this.params$
      .pipe(withLatestFrom(this.path$), take(1))
      .subscribe(([params, path]) => {
        this.router.navigate(['datastore', path, 'inspect', params]);
      });
  }
  closeTab() {
    if (this.ignoreClick) return;
    this.params$
      .pipe(withLatestFrom(this.path$), take(1))
      .subscribe(([params, path]) => {
        const strIndex = this.ds.index + '';
        params['viewing'] = (params['viewing'] as string[]).filter(
          (p) => p != strIndex
        );
        params['ready'] = (params['ready'] as string[]).filter(
          (p) => p != strIndex
        );
        if (params['viewing'].length == 0 && params['ready'].length > 0) {
          params['viewing'] = [params['ready'][0]];
        }
        this.router.navigate(['datastore', path, 'inspect', params]);
      });
  }
}
