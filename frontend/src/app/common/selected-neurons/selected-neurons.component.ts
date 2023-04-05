import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  distinctUntilChanged,
  shareReplay,
  takeUntil,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import {
  addSelectedNodes,
  hoverNode,
  selectNodes,
} from 'src/app/store/actions/model.actions';
import { State } from 'src/app/store/reducers';
import { Connection, NetworkNode } from 'src/app/store/reducers/model.reducer';
import { getAllIncomingConnections } from 'src/app/utils/network';

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
  hoveredNode$ = this.store.select((x) => x.model.hovered).pipe(shareReplay(1));

  nodeData: { node: NetworkNode; in: { [key: string]: Connection[] } }[];

  constructor(private store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    combineLatest([
      this.allNodes$.pipe(distinctUntilChanged()),
      this.selectedNodes$.pipe(distinctUntilChanged()),
    ])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([all, selected]) => {
        this.nodeData = selected.map((n) => ({
          node: n,
          in: getAllIncomingConnections(n, all),
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
    return Object.values(sheets).reduce(
      (total, conns) =>
        total + ('length' in conns ? conns.length : conns.connections.length),
      0
    );
  }
}