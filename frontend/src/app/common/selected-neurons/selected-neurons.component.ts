import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  distinctUntilChanged,
  pairwise,
  shareReplay,
  take,
  takeUntil,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { DialogService } from 'src/app/services/dialog.service';
import {
  addSelectedNodes,
  hoverNode,
  selectNodes,
} from 'src/app/store/actions/model.actions';
import { State } from 'src/app/store/reducers';
import { Connection, NetworkNode } from 'src/app/store/reducers/model.reducer';
import { getAllIncomingConnections } from 'src/app/utils/network';
import {
  AddNeuronComponent,
  AddNeuronResult,
} from './add-neuron/add-neuron.component';

@Component({
  selector: 'mozaik-selected-neurons',
  templateUrl: './selected-neurons.component.html',
  styleUrls: ['./selected-neurons.component.scss'],
})
export class SelectedNeuronsComponent
  extends UnsubscribingComponent
  implements OnInit
{
  selectedNodes$ = this.store.select((x) => x.model.selected);
  allNodes$ = this.store.select((x) => x.model.currentModel?.nodes || []);
  hoveredNode$ = this.store
    .select((x) => x.model.hovered)
    .pipe(takeUntil(this.onDestroy$), shareReplay(1));

  nodeData: { node: NetworkNode; in: { [key: string]: Connection[] } }[];

  constructor(private store: Store<State>, private dialogS: DialogService) {
    super();
  }

  ngOnInit(): void {
    this.selectedNodes$
      .pipe(distinctUntilChanged(), takeUntil(this.onDestroy$))
      .subscribe((curr) => {
        this.nodeData = curr.map((n) => ({
          node: n,
          in: null,
        }));
      });
  }

  hoverNode(n: NetworkNode | number) {
    this.store.dispatch(hoverNode({ node: n }));
  }
  handleSelect(e: MouseEvent, node: NetworkNode | number) {
    e.preventDefault();
    if (e.shiftKey) {
      this.store.dispatch(
        addSelectedNodes({ nodes: [node] as number[] | NetworkNode[] })
      );
    } else {
      this.store.dispatch(
        selectNodes({ nodes: [node] as number[] | NetworkNode[] })
      );
    }
  }

  trackById(index: number, item: { node: NetworkNode }) {
    return item.node.id;
  }

  sumSheets(sheets: {
    [key: string]: Connection[] | NetworkNode['sheets'][string];
  }) {
    if (!sheets) return 'pending';
    return Object.values(sheets).reduce(
      (total, conns) =>
        total + ('length' in conns ? conns.length : conns.connections.length),
      0
    );
  }

  loadIncomingConnections(index: number) {
    if (this.nodeData[index].in === null) {
      let all: NetworkNode[];
      this.allNodes$.pipe(take(1)).subscribe((nodes) => (all = nodes));
      this.nodeData[index].in = getAllIncomingConnections(
        this.nodeData[index].node,
        all
      );
    }
  }

  addNeuron() {
    this.allNodes$.pipe(take(1)).subscribe((nodes) => {
      const elref = this.dialogS.open(AddNeuronComponent);
      elref.nodes = nodes;
      elref.addEventListener('close', () => this.dialogS.close());
      elref.addEventListener('value', (e: Event) => {
        this.dialogS.close();
        const val = (e as CustomEvent<AddNeuronResult>).detail;
        this.store.dispatch(
          val.replace
            ? selectNodes({ nodes: [val.neuron] })
            : addSelectedNodes({ nodes: [val.neuron] })
        );
      });
    });
  }
}
