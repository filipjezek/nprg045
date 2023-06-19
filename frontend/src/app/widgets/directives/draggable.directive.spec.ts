import { Component } from '@angular/core';
import { DraggableDirective } from './draggable.directive';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { GlobalEventServiceStub } from 'src/app/testing/global-event.service.stub';
import { MouseSimulator } from 'src/app/testing/mouse-simulator';

const TAB_WIDTH = 50;
const TAB_HEIGHT = 10;

@Component({
  template: `
    <div
      class="item"
      *ngFor="let item of items; index as i"
      [mozaikDraggable]
      (swapLeft)="swap(i, i - 1)"
      (swapRight)="swap(i, i + 1)"
    >
      {{ item }}
    </div>
  `,
  // i cannot use interpolation here, because it messes up code highlighting
  // for the whole document
  styles: [
    `
      :host {
        display: flex;
        width: ` +
      TAB_WIDTH * 3 +
      `px;
        height: ` +
      TAB_HEIGHT +
      `px;
        overflow-x: auto;
      }
      .item {
        flex-shrink: 0;
        width: ` +
      TAB_WIDTH +
      `px;
        height: ` +
      TAB_HEIGHT +
      `px;
      }
    `,
  ],
})
class Container {
  items = [0, 1, 2, 3, 4];

  swap(a: number, b: number) {
    const temp = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = temp;
  }
}

describe('DraggableDirective', () => {
  let component: Container;
  let fixture: ComponentFixture<Container>;
  let el: HTMLElement;
  let gEventS: GlobalEventServiceStub;
  const getItem = (i: number) =>
    el.querySelector(`.item:nth-of-type(${i + 1})`) as HTMLElement;
  const liftItem = (item: HTMLElement) => {
    const bbox = item.getBoundingClientRect();
    return new MouseSimulator(
      bbox.x + TAB_WIDTH / 4,
      bbox.y + TAB_HEIGHT / 4,
      gEventS,
      fixture
    ).event('mousedown', item);
  };
  const assertConsistency = (items: number[]) => {
    expect(component.items)
      .withContext('component.items should be')
      .toEqual(items);
    expect(component.items)
      .withContext('component.items equal template state')
      .toEqual(
        Array.from(el.querySelectorAll('.item')).map((x) => +x.textContent)
      );
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Container, DraggableDirective],
      providers: [
        { provide: GlobalEventService, useClass: GlobalEventServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Container);
    component = fixture.componentInstance;
    gEventS = TestBed.inject(GlobalEventService) as any;
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('swapping single item', () => {
    it('should swap after 50% width', () => {
      const item = getItem(1);
      liftItem(item)
        .move(TAB_WIDTH / 2 + 1, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([0, 2, 1, 3, 4]);
    });
    it('should not swap before 50% width', fakeAsync(() => {
      const item = getItem(1);
      liftItem(item)
        .move(TAB_WIDTH / 2 - 1, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([0, 1, 2, 3, 4]);
    }));
    it('should not swap over boundary', fakeAsync(() => {
      const item = getItem(0);
      liftItem(item)
        .move(-TAB_WIDTH, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([0, 1, 2, 3, 4]);
    }));
    it('should swap left', fakeAsync(() => {
      const item = getItem(1);
      liftItem(item)
        .move(-TAB_WIDTH / 2 - 1, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([1, 0, 2, 3, 4]);
    }));
  });

  describe('swapping multiple items', () => {
    it('should swap left', () => {
      const item = getItem(2);
      liftItem(item)
        .move(-TAB_WIDTH / 2 - 1, 0)
        .event('mousemove', el)
        .move(-TAB_WIDTH, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([2, 0, 1, 3, 4]);
    });

    it('should swap right', () => {
      const item = getItem(0);
      liftItem(item)
        .move(TAB_WIDTH / 2 + 1, 0)
        .event('mousemove', el)
        .move(TAB_WIDTH, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([1, 2, 0, 3, 4]);
    });

    it('should swap in multiple directions', fakeAsync(() => {
      const item = getItem(2);
      liftItem(item)
        .move(-TAB_WIDTH / 2 - 1, 0)
        .event('mousemove', el)
        .move(-TAB_WIDTH, 0)
        .event('mousemove', el)
        .move(TAB_WIDTH, 0)
        .event('mousemove', el)
        .move(TAB_WIDTH / 2, 0)
        .event('mousemove', el)
        .event('mouseup', el);
      assertConsistency([0, 1, 2, 3, 4]);
    }));
  });

  describe('scrolling', () => {
    it('should scroll right', fakeAsync(() => {
      const item = getItem(0);
      const ref = liftItem(item);
      ref
        .move(TAB_WIDTH / 2 + 1, 0)
        .event('mousemove', el)
        .move(TAB_WIDTH, 0)
        .event('mousemove', el)
        .move(TAB_WIDTH, 0)
        .event('mousemove', el);
      tick(100);
      fixture.detectChanges();
      tick(100);
      fixture.detectChanges();
      ref.event('mouseup', el);
      assertConsistency([1, 2, 3, 4, 0]);
    }));

    it('should scroll left', fakeAsync(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
      const item = getItem(4);
      const ref = liftItem(item);
      ref
        .move(-TAB_WIDTH / 2 - 1, 0)
        .event('mousemove', el)
        .move(-TAB_WIDTH, 0)
        .event('mousemove', el)
        .move(-TAB_WIDTH, 0)
        .event('mousemove', el);
      tick(100);
      fixture.detectChanges();
      tick(100);
      fixture.detectChanges();
      ref.event('mouseup', el);
      assertConsistency([4, 0, 1, 2, 3]);
    }));
  });
});
