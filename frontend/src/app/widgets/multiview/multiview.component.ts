import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewContainerRef,
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
  withLatestFrom,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiviewComponent
  extends UnsubscribingComponent
  implements OnInit, AfterViewInit
{
  @Input() set mainAxisOrder(fn: OrderingFn) {
    this.mainOrderSubj.next(fn);
  }
  get mainAxisOrder(): OrderingFn {
    return this.mainOrderSubj.value;
  }
  @Input() set secondaryAxisOrder(fn: OrderingFn) {
    this.secondaryOrderSubj.next(fn);
  }
  get secondaryAxisOrder(): OrderingFn {
    return this.secondaryOrderSubj.value;
  }
  @Input() set secondaryAxisGroup(fn: GroupingFn) {
    this.secondaryGroupSubj.next(fn);
  }
  get secondaryAxisGroup(): GroupingFn {
    return this.secondaryGroupSubj.value;
  }
  private mainOrderSubj = new BehaviorSubject<OrderingFn>(undefined);
  private secondaryOrderSubj = new BehaviorSubject<OrderingFn>(undefined);
  private secondaryGroupSubj = new BehaviorSubject<GroupingFn>(undefined);

  /**
   * size basis of groups
   */
  @Input() ratios: number[] = [];
  @Output() ratiosChange = new EventEmitter<number[]>();
  /**
   * is size basis a percentage or number of pixels
   */
  @Input() relativeRatios = true;
  /**
   * default row size when size basis is number of pixels
   */
  @Input() defaultGroupSize = 100;
  /**
   * is the main axis vertical or horizontal?
   */
  @Input() @HostBinding('class.vertical') vertical = false;

  @ContentChildren(MultiviewPartitionComponent)
  private partitions: QueryList<MultiviewPartitionComponent>;

  partitions$: Observable<MultiviewPartitionComponent[][]>;

  constructor(
    private gEventS: GlobalEventService,
    private changeDetector: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.partitions$ = this.createPartitions();
    this.changeDetector.markForCheck();
  }

  private createPartitions() {
    return combineLatest([
      this.partitions.changes.pipe(startWith(this.partitions)) as Observable<
        QueryList<MultiviewPartitionComponent>
      >,
      this.mainOrderSubj.pipe(
        map((fn) => fn || ((() => 0) as OrderingFn)),
        distinctUntilChanged()
      ),
      this.secondaryOrderSubj.pipe(
        map((fn) => fn || ((() => 0) as OrderingFn)),
        distinctUntilChanged()
      ),
      this.secondaryGroupSubj.pipe(
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
          this.ratios = Array(grid.length).fill(
            this.relativeRatios ? 100 / grid.length : this.defaultGroupSize
          );
        }
      }),
      takeUntil(this.onDestroy$)
    );
  }

  startDrag(initE: MouseEvent, index: number) {
    initE.preventDefault();
    const second = (initE.target as HTMLElement).closest(
      '.group'
    ) as HTMLElement;
    const first = second.previousElementSibling as HTMLElement;

    const totalPct = this.ratios[index] + this.ratios[index - 1];
    const initialFirstSize = this.vertical
      ? first.clientHeight
      : first.clientWidth;
    const totalSize =
      (this.vertical ? second.clientHeight : second.clientWidth) +
      initialFirstSize;

    this.gEventS.mouseMove
      .pipe(
        withLatestFrom(this.partitions$),
        takeUntil(this.gEventS.mouseReleased)
      )
      .subscribe(([e, columns]) => {
        e.preventDefault();
        let firstSize =
          initialFirstSize + (this.vertical ? e.y - initE.y : e.x - initE.x);
        const min = MultiviewPartitionComponent.minSize;

        if (this.relativeRatios) {
          firstSize = Math.max(min, Math.min(firstSize, totalSize - min));
          this.notifyVisibilityChanges(index, columns, firstSize, totalSize);
          this.ratios[index - 1] = totalPct * (firstSize / totalSize);
          this.ratios[index] = totalPct - this.ratios[index - 1];
        } else {
          firstSize = Math.max(min, firstSize);
          this.notifyVisibilityChanges(index, columns, firstSize, totalSize);
          this.ratios[index - 1] = firstSize;
        }

        this.ratiosChange.emit([...this.ratios]);
        this.changeDetector.markForCheck();
      });
  }

  private notifyVisibilityChanges(
    index: number,
    columns: MultiviewPartitionComponent[][],
    firstSize: number,
    totalSize: number
  ) {
    const min = 2 * MultiviewPartitionComponent.minSize;
    let initialFirstSize = this.ratios[index];
    if (this.relativeRatios) {
      initialFirstSize =
        (this.ratios[index - 1] * totalSize) /
        (this.ratios[index] + this.ratios[index - 1]);
    }
    if (firstSize >= min && initialFirstSize < min) {
      console.log(index - 1, 'visible');
      columns[index - 1].forEach((col) => col.visible.emit(true));
    } else if (firstSize < min && initialFirstSize >= min) {
      console.log(index - 1, 'not visible');
      columns[index - 1].forEach((col) => col.visible.emit(false));
    }
    if (totalSize - firstSize >= min && totalSize - initialFirstSize < min) {
      console.log(index, 'visible');
      columns[index].forEach((col) => col.visible.emit(true));
    } else if (
      totalSize - firstSize < min &&
      totalSize - initialFirstSize >= min
    ) {
      console.log(index, 'not visible');
      columns[index].forEach((col) => col.visible.emit(false));
    }
  }
}
