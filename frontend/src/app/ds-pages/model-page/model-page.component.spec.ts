import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from '../../store/reducers';
import { StoreStub } from '../../testing/store.stub';

import { ModelPageComponent } from './model-page.component';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { loadSpecificAds } from 'src/app/store/actions/ads.actions';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import {
  AdsIdentifier,
  PerNeuronValue,
} from 'src/app/store/reducers/ads.reducer';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { Extent } from '../common/scale/scale.component';
import { By } from '@angular/platform-browser';
import { PurefnPipe } from 'src/app/widgets/pipes/purefn.pipe';
import { EdgeDirection } from '../common/network-graph/network-graph.component';

@Component({
  template: '',
  selector: 'mozaik-pnv-network-graph',
})
class NetworkGraphStub {
  @Input() pnvFilter: Extent;
}

describe('ModelPageComponent', () => {
  let component: ModelPageComponent;
  let fixture: ComponentFixture<ModelPageComponent>;
  let store: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelPageComponent, NetworkGraphStub, PurefnPipe],
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
          { index: 3, identifier: AdsIdentifier.PerNeuronValue },
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
    fixture = TestBed.createComponent(ModelPageComponent);
    component = fixture.componentInstance;
    component.ads = {
      index: 3,
      identifier: AdsIdentifier.PerNeuronValue,
    } as any;
    fixture.detectChanges();
    store.subject.next({
      ...store.subject.value,
      ads: {
        ...store.subject.value.ads,
        selectedAds: [
          {
            index: 3,
            identifier: AdsIdentifier.PerNeuronValue,
            values: [1, 2, 13, 4, 5, 6, 7, -8, 9],
            ids: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          } as Partial<PerNeuronValue>,
        ],
      },
    });
    tick(100);
    tick();
  }));

  it('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should load full ads', () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      loadSpecificAds({ index: 3, path: 'testpath' })
    );
  });

  it('should init tab state', () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      setTabState({ index: 3, state: jasmine.anything() })
    );
  });

  it('should compute recommended thresholds', () => {
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({ thresholds: 5 })
    );
  });

  it('should compute extent of the values', () => {
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({
        pnv: { min: -8, max: 13 },
      })
    );
  });

  it('should not delay when changing regular form values', fakeAsync(() => {
    component.optionsForm.patchValue({ edges: EdgeDirection.incoming });
    tick(0);
    expect(store.subject.value.inspector.tabs[3]).toEqual(
      jasmine.objectContaining({
        edges: EdgeDirection.incoming,
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
