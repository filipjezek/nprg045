import {
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  OnInit,
  QueryList,
} from '@angular/core';
import { MultiviewPartitionComponent } from './multiview-partition/multiview-partition.component';
import {
  BehaviorSubject,
  combineLatest,
  delay,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { groupBy } from 'src/app/utils/group-by';
import { GlobalEventService } from 'src/app/services/global-event.service';

export type OrderingFn = (
  a: MultiviewPartitionComponent,
  b: MultiviewPartitionComponent
) => -1 | 0 | 1;
export type GroupingFn = (
  partition: MultiviewPartitionComponent,
  index: number
) => any;

@Component({
  selector: 'mozaik-multiview',
  templateUrl: './multiview.component.html',
  styleUrls: ['./multiview.component.scss'],
})
export class MultiviewComponent
  extends UnsubscribingComponent
  implements OnInit, AfterViewInit
{
  @Input() set xAxisOrder(fn: OrderingFn) {
    this.xOrderSubj.next(fn);
  }
  get xAxisOrder(): OrderingFn {
    return this.xOrderSubj.value;
  }
  @Input() set yAxisOrder(fn: OrderingFn) {
    this.yOrderSubj.next(fn);
  }
  get yAxisOrder(): OrderingFn {
    return this.yOrderSubj.value;
  }
  @Input() set yAxisGroup(fn: GroupingFn) {
    this.yGroupSubj.next(fn);
  }
  get yAxisGroup(): GroupingFn {
    return this.yGroupSubj.value;
  }
  private xOrderSubj = new BehaviorSubject<OrderingFn>(undefined);
  private yOrderSubj = new BehaviorSubject<OrderingFn>(undefined);
  private yGroupSubj = new BehaviorSubject<GroupingFn>(undefined);

  /**
   * width percentage of columns
   */
  @Input() ratios: number[] = [];

  @ContentChildren(MultiviewPartitionComponent)
  private partitions: QueryList<MultiviewPartitionComponent>;

  partitions$: Observable<MultiviewPartitionComponent[][]>;

  constructor(private gEventS: GlobalEventService) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.partitions$ = this.createPartitions();
  }

  private createPartitions() {
    return combineLatest([
      this.partitions.changes.pipe(startWith(this.partitions)) as Observable<
        QueryList<MultiviewPartitionComponent>
      >,
      this.xOrderSubj.pipe(
        map((fn) => fn || ((() => 0) as OrderingFn)),
        distinctUntilChanged()
      ),
      this.yOrderSubj.pipe(
        map((fn) => fn || ((() => 0) as OrderingFn)),
        distinctUntilChanged()
      ),
      this.yGroupSubj.pipe(
        map((fn) => fn || (((p, i) => i) as GroupingFn)),
        distinctUntilChanged()
      ),
    ]).pipe(
      map(([partitions, xOrder, yOrder, yGroup]) => {
        return Object.values(groupBy(Array.from(partitions), yGroup))
          .map((p) => p.sort(yOrder))
          .sort((a, b) => xOrder(a[0], b[0]));
      }),
      delay(0),
      tap((grid) => {
        if (grid.length != this.ratios.length) {
          this.ratios = Array(grid.length).fill(100 / grid.length);
        }
      }),
      takeUntil(this.onDestroy$)
    );
  }

  startDrag(initE: MouseEvent, index: number) {
    initE.preventDefault();
    const right = (initE.target as HTMLElement).closest(
      '.column'
    ) as HTMLElement;
    const left = right.previousElementSibling as HTMLElement;

    const totalPct = this.ratios[index] + this.ratios[index - 1];
    const initialLeftWidth = left.clientWidth;
    const totalWidth = right.clientWidth + initialLeftWidth;

    this.gEventS.mouseMove
      .pipe(takeUntil(this.gEventS.mouseReleased))
      .subscribe((e) => {
        e.preventDefault();
        let leftWidth = initialLeftWidth + e.x - initE.x;
        leftWidth = Math.max(0, Math.min(leftWidth, totalWidth));
        this.ratios[index - 1] = totalPct * (leftWidth / totalWidth);
        this.ratios[index] = totalPct - this.ratios[index - 1];
      });
  }
}
