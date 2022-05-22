import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  Connection,
  getAllIncomingConnections,
  getIncomingConnections,
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
}
