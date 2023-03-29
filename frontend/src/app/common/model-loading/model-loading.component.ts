import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { NetworkProgress } from 'src/app/store/reducers/model.reducer';

@Component({
  selector: 'mozaik-model-loading',
  templateUrl: './model-loading.component.html',
  styleUrls: ['./model-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelLoadingComponent implements OnInit {
  @Input() progress: NetworkProgress;

  constructor() {}

  ngOnInit(): void {}
}
