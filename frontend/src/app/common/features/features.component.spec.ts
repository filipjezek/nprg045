import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { RouterLinkStub } from 'src/app/testing/routerlink.stub';
import { StoreStub } from 'src/app/testing/store.stub';
import { FeaturesComponent } from './features.component';

describe('FeaturesComponent', () => {
  let component: FeaturesComponent;
  let fixture: ComponentFixture<FeaturesComponent>;
  let el: HTMLElement;
  let storeStub: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeaturesComponent, RouterLinkStub],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Store, useClass: StoreStub }],
    }).compileComponents();
  });

  beforeEach(() => {
    storeStub = TestBed.inject(Store) as any;
    fixture = TestBed.createComponent(FeaturesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
