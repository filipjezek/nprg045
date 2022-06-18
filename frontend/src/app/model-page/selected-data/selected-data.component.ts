import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  Connection,
  getAllIncomingConnections,
  NetworkNode,
} from 'src/app/store/reducers/model.reducer';

@Component({
  selector: 'mozaik-selected-data',
  templateUrl: './selected-data.component.html',
  styleUrls: ['./selected-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedDataComponent implements OnChanges {
  @Input() selectedNodes: NetworkNode[];
  @Input() allNodes: NetworkNode[];
  @Input() hoveredNode: NetworkNode;
  @Output() hoveredNodeChange = new EventEmitter<NetworkNode>();
  @Output() select = new EventEmitter<NetworkNode[]>();

  nodeData: { node: NetworkNode; in: { [key: string]: Connection[] } }[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNodes'] || changes['allNodes']) {
      this.nodeData = this.selectedNodes.map((n) => ({
        node: n,
        in: getAllIncomingConnections(n, this.allNodes),
      }));
    }
  }

  hoverNode(n: NetworkNode) {
    this.hoveredNode = n;
    this.hoveredNodeChange.emit(n);
  }
  handleSelect(e: MouseEvent, node: NetworkNode) {
    e.preventDefault();
    if (this.selectedNodes.find((n) => n.id === node.id)) {
      if (e.shiftKey) {
        this.selectedNodes = this.selectedNodes.filter((n) => n.id !== node.id);
      } else {
        this.selectedNodes = [];
      }
    } else {
      if (e.shiftKey) {
        this.selectedNodes = [...this.selectedNodes, node];
      } else {
        this.selectedNodes = [node];
      }
    }
    this.select.emit(this.selectedNodes);
  }
}
