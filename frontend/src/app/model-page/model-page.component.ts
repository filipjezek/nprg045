import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { loadModel } from '../store/actions/model.actions';
import { NetworkNode, State } from '../store/reducers/model.reducer';
import { RadioOption } from '../widgets/button-radio/button-radio.component';
import { EdgeDirection } from './network-graph/network-graph.component';

@Component({
  selector: 'mozaik-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent implements OnInit {
  model$ = this.store.select((x) => x.model.currentModel);
  edges: RadioOption[] = [
    { label: 'Incoming', value: EdgeDirection.incoming },
    { label: 'Outgoing', value: EdgeDirection.outgoing },
    { label: 'All', value: EdgeDirection.all },
  ];
  edgeControl = new FormControl(EdgeDirection.outgoing);
  selectedNodes: NetworkNode[] = [];
  hoveredNode: NetworkNode;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.store.dispatch(loadModel());
  }
}
