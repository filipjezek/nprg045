import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { DsInfoComponent } from './ds-info.component';
import { StoreStub } from 'src/app/testing/store.stub';
import { Store } from '@ngrx/store';
import { toggleDsInfo } from 'src/app/store/actions/inspector.actions';
import { State } from 'src/app/store/reducers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DsInfoComponent', () => {
  let component: DsInfoComponent;
  let fixture: ComponentFixture<DsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DsInfoComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DsInfoComponent);
    component = fixture.componentInstance;
    component.ds = { index: 3 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle', fakeAsync(() => {
    const store: StoreStub<State> = TestBed.inject(Store) as any;
    store.subject.next({ inspector: { dsInfoCollapsed: true } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.toggle').click();
    expect(store.dispatch).toHaveBeenCalledWith(
      toggleDsInfo({ collapsed: false })
    );
  }));
});
