import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsTabHandleComponent } from './ds-tab-handle.component';
import { Router } from '@angular/router';
import { RouterStub } from 'src/app/testing/router.stub';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';

describe('DsTabHandleComponent', () => {
  let component: DsTabHandleComponent;
  let fixture: ComponentFixture<DsTabHandleComponent>;
  let el: HTMLElement;
  let router: RouterStub;
  let store: StoreStub;
  let tab: HTMLElement;
  let routerState: Record<string, string>;

  beforeEach(async () => {
    spyOn(routerSelectors, 'selectRouteParam').and.callFake(
      (param) => (() => routerState[param]) as any
    );
    spyOn(routerSelectors, 'selectRouteParams').and.callFake(
      (() => routerState) as any
    );
    routerState = {
      viewing: '1',
      ready: '0,1,2,3,4',
      path: 'mypath',
    };

    await TestBed.configureTestingModule({
      declarations: [DsTabHandleComponent],
      providers: [
        {
          provide: Router,
          useClass: RouterStub,
        },
        {
          provide: Store,
          useClass: StoreStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DsTabHandleComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as any;
    store = TestBed.inject(Store) as any;
    component.ds = { index: 3 };
    fixture.detectChanges();
    el = fixture.nativeElement;
    tab = el.querySelector('.tab');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting tab', () => {
    it('should select tab', () => {
      tab.click();
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith([
        'datastore',
        'mypath',
        'inspect',
        jasmine.objectContaining({
          viewing: ['3'],
          ready: ['0', '1', '2', '3', '4'],
        }),
      ]);
    });
    it('should not deselect tab', () => {
      routerState['viewing'] = '3';
      store.dispatch({});
      tab.click();
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith([
        'datastore',
        'mypath',
        'inspect',
        jasmine.objectContaining({
          viewing: ['3'],
          ready: ['0', '1', '2', '3', '4'],
        }),
      ]);
    });
  });

  describe('selecting additional tab', () => {
    it('should select additional tab', () => {
      tab.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith([
        'datastore',
        'mypath',
        'inspect',
        jasmine.objectContaining({
          viewing: ['1', '3'],
          ready: ['0', '1', '2', '3', '4'],
        }),
      ]);
    });

    it('should deselect additional tab', () => {
      routerState['viewing'] = '1,3';
      store.dispatch({});
      tab.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith([
        'datastore',
        'mypath',
        'inspect',
        jasmine.objectContaining({
          viewing: ['1'],
          ready: ['0', '1', '2', '3', '4'],
        }),
      ]);
    });

    it('should insert additional tab into correct place', () => {
      routerState['viewing'] = '0,1,4';
      store.dispatch({});
      tab.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith([
        'datastore',
        'mypath',
        'inspect',
        jasmine.objectContaining({
          viewing: ['0', '1', '3', '4'],
          ready: ['0', '1', '2', '3', '4'],
        }),
      ]);
    });
  });

  it('should close tab', () => {
    routerState['viewing'] = '0,3,4';
    store.dispatch({});
    tab.dispatchEvent(new MouseEvent('auxclick', { button: 1 }));
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith([
      'datastore',
      'mypath',
      'inspect',
      jasmine.objectContaining({
        viewing: ['0', '4'],
        ready: ['0', '1', '2', '4'],
      }),
    ]);
  });
});
