import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { AslPageComponent } from './asl-page.component';
import {
  AdsIdentifier,
  AnalogSignalList,
} from 'src/app/store/reducers/ads.reducer';
import { setTabState } from 'src/app/store/actions/inspector.actions';
import { inspectorSelectors } from 'src/app/store/selectors/inspector.selectors';
import { PurefnPipe } from 'src/app/widgets/pipes/purefn.pipe';
import { StoreStub } from 'src/app/testing/store.stub';
import { State } from 'src/app/store/reducers';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { loadSpecificAds } from 'src/app/store/actions/ads.actions';

describe('AslPageComponent', () => {
  let component: AslPageComponent;
  let fixture: ComponentFixture<AslPageComponent>;
  let store: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AslPageComponent, PurefnPipe],
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
          { index: 3, identifier: AdsIdentifier.AnalogSignalList },
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
    fixture = TestBed.createComponent(AslPageComponent);
    component = fixture.componentInstance;
    component.ads = {
      index: 3,
      identifier: AdsIdentifier.AnalogSignalList,
    } as any;
    fixture.detectChanges();
    store.subject.next({
      ...store.subject.value,
      ads: {
        ...store.subject.value.ads,
        selectedAds: [
          {
            index: 3,
            identifier: AdsIdentifier.AnalogSignalList,
            values: [
              [1, 2, 13],
              [4, 5, 6],
              [7, -8, 9],
            ],
            ids: [10, 11, 12],
          } as Partial<AnalogSignalList>,
        ],
      },
    });
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
});
