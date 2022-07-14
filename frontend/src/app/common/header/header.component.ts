import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
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

@Component({
  selector: 'mozaik-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('menu', [
      transition(':enter', [
        style({ left: '-275px' }),
        animate('0.25s ease-out'),
      ]),
      transition(':leave', [
        animate('0.15s ease-in', style({ left: '-275px' })),
      ]),
    ]),
  ],
})
export class HeaderComponent extends UnsubscribingComponent implements OnInit {
  faFolderTree = faFolderTree;
  filesystemOpen = false;
  filesystem$ = this.store.select((x) => x.fs.datastores);
  currDatastore$ = this.store.select((x) => x.fs.selectedDatastore);

  constructor(
    private store: Store<State>,
    private gEventS: GlobalEventService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    zip(
      this.filesystem$.pipe(filter((x) => !!x)),
      this.router.events.pipe(
        filter((e) => e instanceof NavigationStart),
        delay(0)
      )
    )
      .pipe(
        take(1),
        switchMap(() => this.currDatastore$),
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
      this.router.events.pipe(filter((e) => e instanceof NavigationStart))
    )
      .pipe(
        withLatestFrom(this.currDatastore$),
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
