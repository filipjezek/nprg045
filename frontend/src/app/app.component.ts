import { transition, trigger, useAnimation } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { faSatelliteDish } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { auditTime } from 'rxjs';
import { fade } from './animations';
import { NetworkTrackerComponent } from './common/network-tracker/network-tracker.component';
import { DialogService } from './services/dialog.service';
import { loadDirectory } from './store/actions/filesystem.actions';
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
            end: '*',
            time: '0.1s',
          },
        })
      ),
      transition(
        ':leave',
        useAnimation(fade, {
          params: {
            start: '*',
            end: '0',
            time: '0.1s',
          },
        })
      ),
    ]),
  ],
})
export class AppComponent implements OnInit {
  showLoadingOverlay$ = this.store
    .select((x) => x.ui.loadingOverlay > 0)
    .pipe(auditTime(50));
  overlay$ = this.store.select((x) => x.ui.overlay);
  showNetworkButton$ = this.store.select((x) => x.net.requests.length > 0);
  modelLoading$ = this.store.select((x) => x.model.loading);

  faSatelliteDish = faSatelliteDish;

  constructor(private store: Store<State>, private dialogS: DialogService) {}

  ngOnInit(): void {
    this.store.dispatch(loadDirectory({}));
  }

  openNetwork() {
    const ref = this.dialogS.open(NetworkTrackerComponent, true, {
      zIndex: 11,
    });
    ref.addEventListener('close', () => this.dialogS.close());
  }
}
