import { transition, trigger, useAnimation } from '@angular/animations';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { auditTime } from 'rxjs';
import { fade } from './animations';
import { State } from './store/reducers';

@Component({
  selector: 'mozaik-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fade', [
      transition(
        ':enter',
        useAnimation(fade, {
          params: {
            start: '0',
            end: '1',
            time: '0.1s',
          },
        })
      ),
      transition(
        ':leave',
        useAnimation(fade, {
          params: {
            start: '1',
            end: '0',
            time: '0.1s',
          },
        })
      ),
    ]),
  ],
})
export class AppComponent {
  showLoadingOverlay$ = this.store
    .select((x) => x.ui.loadingOverlay > 0)
    .pipe(auditTime(50));

  constructor(private store: Store<State>) {}
}
