import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadModel } from '../store/actions/model.actions';
import { State } from '../store/reducers/model.reducer';

@Component({
  selector: 'mozaik-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent implements OnInit {
  model$ = this.store.select((x) => x.model.currentModel);

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.store.dispatch(loadModel());
  }
}
