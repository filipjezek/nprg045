import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import {
  delay,
  filter,
  merge,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
  zip,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { closeOverlay, openOverlay } from 'src/app/store/actions/ui.actions';
import { State } from 'src/app/store/reducers';
import { selectRouteParam } from 'src/app/store/selectors/router.selectors';

@Component({
  selector: 'mozaik-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('menu', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.25s ease-out'),
      ]),
      transition(':leave', [
        animate('0.15s ease-in', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent extends UnsubscribingComponent implements OnInit {
  faFolderTree = faFolderTree;
  filesystemOpen = false;
  filesystem$ = this.store.select((x) => x.fs.datastores);
  datastore$ = this.store.select(selectRouteParam('path'));

  constructor(
    private store: Store<State>,
    private gEventS: GlobalEventService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    zip(
      this.filesystem$.pipe(filter((x) => !!x)),
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
        delay(0)
      )
    )
      .pipe(
        take(1),
        switchMap(() => this.datastore$),
        takeUntil(this.onDestroy$)
      )
      .subscribe((curr) => {
        if (!curr && !this.filesystemOpen) {
          this.toggleSideMenu();
        }
      });
    merge(
      this.gEventS.escapePressed,
      this.gEventS.overlayClicked,
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd))
    )
      .pipe(
        withLatestFrom(this.datastore$),
        filter(([e, curr]) => curr && this.filesystemOpen),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.toggleSideMenu();
      });
  }

  toggleSideMenu() {
    this.filesystemOpen = !this.filesystemOpen;
    if (this.filesystemOpen) {
      this.store.dispatch(openOverlay({ overlay: {} }));
    } else {
      this.store.dispatch(closeOverlay());
    }
  }
}
