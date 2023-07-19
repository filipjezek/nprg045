import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DsPage } from '../common/ds-page';
import { Ads } from 'src/app/store/reducers/ads.reducer';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';

@Component({
  selector: 'mozaik-unsupported-page',
  templateUrl: './unsupported-page.component.html',
  styleUrls: ['./unsupported-page.component.scss'],
})
export class UnsupportedPageComponent
  extends DsPage<Ads>
  implements OnInit, OnChanges
{
  @ViewChild('controls') controls: TemplateRef<any>;
  constructor(store: Store<State>) {
    super(store);
  }

  // do not do anything
  ngOnInit(): void {}

  // do not load anything
  ngOnChanges(changes: SimpleChanges): void {}
}
