import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { UnsubscribingComponent } from '../mixins/unsubscribing.mixin';
import { loadModel } from '../store/actions/model.actions';
import { NetworkNode, State } from '../store/reducers/model.reducer';
import { selectRouteParam } from '../store/selectors/router.selectors';
import { RadioOption } from '../widgets/button-radio/button-radio.component';
import { EdgeDirection } from './network-graph/network-graph.component';

@Component({
  selector: 'mozaik-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent
  extends UnsubscribingComponent
  implements OnInit
{
  model$ = this.store.select((x) => x.model.currentModel);
  edges: RadioOption[] = [
    { label: 'Incoming', value: EdgeDirection.incoming },
    { label: 'Outgoing', value: EdgeDirection.outgoing },
    { label: 'All', value: EdgeDirection.all },
  ];
  edgeControl = new FormControl(EdgeDirection.outgoing);
  selectedNodes: NetworkNode[] = [];
  hoveredNode: NetworkNode;
  datastore$ = this.store.select(selectRouteParam('path'));

  constructor(private store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    this.datastore$
      .pipe(
        filter((x) => !!x),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe((path) => {
        this.store.dispatch(loadModel({ path }));
      });
  }
}
