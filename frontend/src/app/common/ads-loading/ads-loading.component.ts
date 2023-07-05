import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AdsProgress } from 'src/app/store/reducers/ads.reducer';

@Component({
  selector: 'mozaik-ads-loading',
  templateUrl: './ads-loading.component.html',
  styleUrls: ['./ads-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsLoadingComponent {
  @Input() progress: AdsProgress[];
}
