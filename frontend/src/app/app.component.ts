import { transition, trigger, useAnimation } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faSatelliteDish } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { auditTime, map } from 'rxjs';
import { fade } from './animations';
import { NetworkTrackerComponent } from './common/network-tracker/network-tracker.component';
import { DialogService } from './services/dialog.service';
import { loadDirectory } from './store/actions/filesystem.actions';
import { State } from './store/reducers';
import { MultiviewPartitionComponent } from './widgets/multiview/multiview-partition/multiview-partition.component';

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
  adsLoading$ = this.store
    .select((x) => x.ads.loading)
    .pipe(map((x) => (x.length ? x : null)));

  @ViewChild('multiview', { read: ElementRef })
  private multiview: ElementRef<HTMLElement>;

  faSatelliteDish = faSatelliteDish;
  ratios = [100, 0, 0];
  minPartitionWidth = MultiviewPartitionComponent.minSize;

  navigatorVisible = true;
  inspectorVisible = false;
  neuronsVisible = false;

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

  openPartition(index: number, direction: 'left' | 'right', limitPx?: number) {
    const newRatios = [...this.ratios];
    const other = index + (direction == 'left' ? -1 : 1);
    const total = newRatios[index] + newRatios[other];
    const maxPct =
      limitPx === undefined
        ? total
        : (limitPx / this.multiview.nativeElement.clientWidth) * 100;

    newRatios[index] = Math.min(total, maxPct);
    newRatios[other] = total - newRatios[index];

    this.ratios = newRatios;
  }
}
