import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { toggleDsInfo } from 'src/app/store/actions/inspector.actions';
import { State } from 'src/app/store/reducers';
import { Ads } from 'src/app/store/reducers/ads.reducer';

@Component({
  selector: 'mozaik-ds-info',
  templateUrl: './ds-info.component.html',
  styleUrls: ['./ds-info.component.scss'],
})
export class DsInfoComponent extends UnsubscribingComponent implements OnInit {
  @Input() ds: Ads;
  @HostBinding('class.collapsed') private collapsed = true;
  collapsed$ = this.store.select((x) => x.inspector.dsInfoCollapsed);

  faChevronLeft = faChevronLeft;

  constructor(private store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    this.collapsed$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((c) => (this.collapsed = c));
  }

  toggle() {
    this.store.dispatch(toggleDsInfo({ collapsed: !this.collapsed }));
  }
}
