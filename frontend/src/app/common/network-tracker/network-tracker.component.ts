import {
  state,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { Component, ElementRef, OnInit } from '@angular/core';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { combineLatest, interval, map } from 'rxjs';
import { dialogClose, dialogOpen } from 'src/app/animations';
import { Dialog } from 'src/app/dialog';
import { requestCancel } from 'src/app/store/actions/network.actions';
import { State } from 'src/app/store/reducers';

@Component({
  selector: 'mozaik-network-tracker',
  templateUrl: './network-tracker.component.html',
  styleUrls: ['./network-tracker.component.scss'],
  animations: [
    trigger('appear', [
      state(
        'closing',
        style({
          height: 0,
        })
      ),
      transition(':enter', [useAnimation(dialogOpen)]),
      transition('* => closing', [useAnimation(dialogClose)]),
    ]),
  ],
})
export class NetworkTrackerComponent extends Dialog implements OnInit {
  static readonly selector = 'network-tracker-dialog';

  faBan = faBan;

  constructor(el: ElementRef, private store: Store<State>) {
    super(el);
  }

  requests$ = combineLatest([
    this.store.select((x) => x.net.requests),
    interval(100).pipe(map(() => Date.now())),
  ]).pipe(
    map(([requests, now]) =>
      requests.map((req) => ({ ...req, duration: now - req.start }))
    )
  );

  trackById(index: number, value: { id: number }) {
    return value.id;
  }

  cancel(id: number) {
    this.store.dispatch(requestCancel({ id }));
  }

  ngOnInit(): void {}
}
