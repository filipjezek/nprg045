import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AdsIdentifier, AdsThumb } from 'src/app/store/reducers/ads.reducer';

@Component({
  selector: 'mozaik-ads',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsComponent implements OnInit, OnChanges {
  @Input() data: AdsThumb;
  @Input() index: number;
  @Input() datastore: string;
  link: string[];
  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      switch (this.data.identifier) {
        case AdsIdentifier.PerNeuronValue:
          this.link = ['model', 'pnv'];
          break;
        default:
          this.link = ['model'];
          break;
      }
    }
  }
}
