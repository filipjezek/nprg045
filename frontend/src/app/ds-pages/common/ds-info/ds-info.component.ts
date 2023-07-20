import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, map, takeUntil } from 'rxjs';
import { subtract } from 'src/app/common/ds-select/sql/user-sql-functions/subtract';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { toggleDsInfo } from 'src/app/store/actions/inspector.actions';
import { State } from 'src/app/store/reducers';
import { Ads } from 'src/app/store/reducers/ads.reducer';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';

@Component({
  selector: 'mozaik-ds-info',
  templateUrl: './ds-info.component.html',
  styleUrls: ['./ds-info.component.scss'],
})
export class DsInfoComponent extends UnsubscribingComponent implements OnInit {
  @HostBinding('class.collapsed') private collapsed = true;
  collapsed$ = this.store.select((x) => x.inspector.dsInfoCollapsed);

  @Input() set index(i: number) {
    this.indexSubj.next(i);
  }
  get index() {
    return this.indexSubj.value;
  }
  private indexSubj = new BehaviorSubject<number>(null);
  ds: Partial<Ads>;

  faChevronLeft = faChevronLeft;

  constructor(private store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    this.collapsed$.pipe(takeUntil(this.onDestroy$)).subscribe((c) => {
      console.log('collapsed', c);
      this.collapsed = c;
    });

    combineLatest([
      this.store.select(inspectorSelectors.selectCommonViewingProps),
      this.indexSubj,
      this.store.select((x) => x.ads.allAds),
    ])
      .pipe(
        map(([common, index, ds]) => {
          const sub = subtract(ds[index], common);
          return isEqual(sub, {}) ? ds[index] : sub;
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe((part) => {
        this.ds = part;
      });
  }

  toggle() {
    this.store.dispatch(toggleDsInfo({ collapsed: !this.collapsed }));
  }
}
