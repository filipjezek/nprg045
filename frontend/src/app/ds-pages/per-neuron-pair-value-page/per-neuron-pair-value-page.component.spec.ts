import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { PerNeuronPairValuePageComponent } from './per-neuron-pair-value-page.component';
import { StoreStub } from 'src/app/testing/store.stub';
import { State } from 'src/app/store/reducers';
import { PurefnPipe } from 'src/app/widgets/pipes/purefn.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import {
  AdsIdentifier,
  PerNeuronPairValue,
} from 'src/app/store/reducers/ads.reducer';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { loadSpecificAds } from 'src/app/store/actions/ads.actions';

describe('PerNeuronPairValuePageComponent', () => {
  let component: PerNeuronPairValuePageComponent;
  let fixture: ComponentFixture<PerNeuronPairValuePageComponent>;
  let store: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerNeuronPairValuePageComponent, PurefnPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Store, useClass: StoreStub }, FormBuilder],
    }).compileComponents();
  });

  beforeEach(fakeAsync(() => {
    spyOn(routerSelectors, 'selectRouteParam').and.returnValue(
      (() => 'testpath') as any
    );
    spyOn(inspectorSelectors, 'selectSameTypeViewing').and.returnValue((() => ({
      index: 3,
    })) as any);
    store = TestBed.inject(Store) as any;
    store.subject.next({
      model: { currentModel: { nodes: [], sheetNodes: {} } },
      inspector: { tabs: {} },
      ads: {
        selectedAds: [],
        allAds: [
          {},
          {},
          {},
          { index: 3, identifier: AdsIdentifier.PerNeuronPairValue },
        ],
      },
    });
    store.dispatch.and.callFake((action) =>
      action.type == setTabState.type
        ? store.subject.next({
            ...store.subject.value,
            inspector: { tabs: { [action.index]: action.state } },
          })
        : null
    );
    fixture = TestBed.createComponent(PerNeuronPairValuePageComponent);
    component = fixture.componentInstance;
    component.ads = {
      index: 3,
      identifier: AdsIdentifier.PerNeuronPairValue,
    } as any;
    fixture.detectChanges();
    store.subject.next({
      ...store.subject.value,
      ads: {
        ...store.subject.value.ads,
        selectedAds: [
          {
            index: 3,
            identifier: AdsIdentifier.PerNeuronPairValue,
            values: [
              [1, 2, 13],
              [4, 5, 6],
              [7, -8, 9],
            ],
            ids: [10, 11, 12],
          } as Partial<PerNeuronPairValue>,
        ],
      },
    });
    tick(100);
    tick();
  }));

  it('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should load full ads', fakeAsync(() => {
    expect(store.dispatch).toHaveBeenCalledWith(
      loadSpecificAds({ index: 3, path: 'testpath' })
    );
  }));

  it('should init tab state', fakeAsync(() => {
    expect(store.dispatch).toHaveBeenCalledWith(
      setTabState({ index: 3, state: jasmine.anything() })
    );
  }));

  it('should compute recommended thresholds', fakeAsync(() => {
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({ thresholds: 5 })
    );
  }));

  it('should compute extent of the values', fakeAsync(() => {
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({
        pnpv: { min: -8, max: 13 },
      })
    );
  }));

  it('should not delay when changing regular form values', fakeAsync(() => {
    component.optionsForm.patchValue({ visualization: 'histogram' });
    tick(0);
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({
        visualization: 'histogram',
      })
    );
  }));

  it('should delay when changing heavy form values', fakeAsync(() => {
    store.dispatch.calls.reset();
    component.optionsForm.patchValue({ thresholds: 7 });
    component.optionsForm.patchValue({ thresholds: 8 });
    component.optionsForm.patchValue({ thresholds: 9 });
    component.optionsForm.patchValue({ thresholds: 10 });
    tick(100);
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({
        thresholds: 10,
      })
    );
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  }));
});
