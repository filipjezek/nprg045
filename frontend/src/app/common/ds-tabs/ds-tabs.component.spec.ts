import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';

import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { DsTabsComponent } from './ds-tabs.component';
import {
  Component,
  EventEmitter,
  NO_ERRORS_SCHEMA,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { State } from 'src/app/store/reducers';
import { PurefnPipe } from 'src/app/widgets/pipes/purefn.pipe';
import { AdsIdentifier } from 'src/app/store/reducers/ads.reducer';
import { Router } from '@angular/router';
import { RouterStub } from 'src/app/testing/router.stub';
import { By } from '@angular/platform-browser';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';

@Component({
  template: `<ng-content></ng-content>`,
  selector: 'mozaik-multiview',
})
class MultiviewStub {}
@Component({
  template: `<ng-content></ng-content>`,
  selector: 'mozaik-multiview-partition',
})
class MultiviewPartitionStub {}
@Component({
  template: `<ng-content></ng-content>`,
  selector: 'mozaik-ds-tab-handle',
})
class TabHandleStub {
  @Output() lift = new EventEmitter<void>();
  @Output() drop = new EventEmitter<void>();
  @Output() swapLeft = new EventEmitter<void>();
  @Output() swapRight = new EventEmitter<void>();
}

@Component({
  template: `
    <ng-template #controls>
      <p class="mock1-controls">{{ instanceNo }}</p>
    </ng-template>
  `,
  selector: 'mock-one',
})
class MockPage1 {
  @ViewChild('controls') public controls: TemplateRef<any>;
  static instances = 0;
  instanceNo = 0;
  constructor() {
    this.instanceNo = MockPage1.instances++;
  }
}
@Component({
  template: `
    <ng-template #controls>
      <p class="mock2-controls">{{ instanceNo }}</p>
    </ng-template>
  `,
  selector: 'mock-two',
})
class MockPage2 {
  @ViewChild('controls') public controls: TemplateRef<any>;
  static instances = 0;
  instanceNo = 0;
  constructor() {
    this.instanceNo = MockPage2.instances++;
  }
}

describe('DsTabsComponent', () => {
  let component: DsTabsComponent;
  let fixture: ComponentFixture<DsTabsComponent>;
  let store: StoreStub<State>;
  let el: HTMLElement;
  let routerState: Record<string, string>;
  let router: RouterStub;

  beforeEach(async () => {
    spyOn(routerSelectors, 'selectRouteParam').and.callFake(
      (param) => (() => routerState[param]) as any
    );
    spyOn(routerSelectors, 'selectRouteParams').and.callFake(
      (() => routerState) as any
    );
    spyOn(inspectorSelectors, 'selectReady').and.callFake(((state: any) =>
      state.ads.allAds.slice(0, 3)) as any);
    spyOn(inspectorSelectors, 'selectViewing').and.callFake(
      ((): any => []) as any
    );
    routerState = {
      viewing: null,
      ready: '0,1,2',
    };
    MockPage1.instances = 0;
    MockPage2.instances = 0;

    await TestBed.configureTestingModule({
      declarations: [
        DsTabsComponent,
        PurefnPipe,
        MultiviewPartitionStub,
        MultiviewStub,
        TabHandleStub,
      ],
      providers: [
        { provide: Store, useClass: StoreStub },
        { provide: Router, useClass: RouterStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DsTabsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as any;
    store.subject.next({
      ads: {
        allAds: [
          { index: 0, identifier: AdsIdentifier.PerNeuronValue },
          { index: 1 },
          { index: 2, identifier: AdsIdentifier.PerNeuronValue },
          { index: 3 },
        ],
      },
      inspector: {
        sharedControls: false,
      },
    });
    // this is dirty but neccessary, because we don't want to actually import
    // and instantiate complex components
    spyOn(component, 'preloadPage' as any).and.callFake((ds: AdsIdentifier) => {
      if (ds == AdsIdentifier.PerNeuronValue) return MockPage1;
      return MockPage2;
    });
    router = TestBed.inject(Router) as any;
    el = fixture.nativeElement;
  });

  beforeEach(fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tabs', fakeAsync(() => {
    expect(
      fixture.debugElement.queryAll(By.directive(TabHandleStub)).length
    ).toBe(3);
  }));

  it('should swap tabs', () => {
    const tab = fixture.debugElement.query(By.directive(TabHandleStub))
      .componentInstance as TabHandleStub;
    tab.lift.emit();
    tab.swapRight.emit();
    tab.swapRight.emit();
    tab.drop.emit();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith([
      'datastore',
      undefined,
      'inspect',
      jasmine.objectContaining({ viewing: [], ready: [1, 2, 0] }),
    ]);
  });

  it('should extract shared controls', fakeAsync(() => {
    (inspectorSelectors.selectViewing as any as jasmine.Spy).and.callFake(((
      state: any
    ) => state.ads.allAds.slice(0, 3)) as any);
    routerState['viewing'] = '0,1,2';
    store.subject.next({ ...store.subject.value });

    fixture.detectChanges();
    tick();
    component.sharedControlsCtrl.setValue(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const controls = Array.from(
      el.querySelectorAll<HTMLElement>('.mock1-controls, .mock2-controls')
    );
    expect(controls.map((c) => c.className)).toEqual([
      'mock1-controls',
      'mock2-controls',
    ]);
    expect(controls.map((c) => c.textContent)).toEqual(['0', '0']);
    expect(
      el.querySelector('mock-one .mock1-controls, mock-two .mock2-controls')
    ).toBeNull();
  }));

  it('should create components based on tab type', fakeAsync(() => {
    (inspectorSelectors.selectViewing as any as jasmine.Spy).and.callFake(((
      state: any
    ) => state.ads.allAds.slice(0, 3)) as any);
    routerState['viewing'] = '0,1,2';
    store.subject.next({ ...store.subject.value });

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const generated = Array.from(
      el.querySelectorAll<HTMLElement>(
        'mozaik-multiview-partition mock-one, mozaik-multiview-partition mock-two'
      )
    );
    expect(generated.map((c) => c.tagName.toLowerCase())).toEqual([
      'mock-one',
      'mock-two',
      'mock-one',
    ]);
  }));
});
