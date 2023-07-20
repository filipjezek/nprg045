import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsupportedPageComponent } from './unsupported-page.component';
import { StoreStub } from 'src/app/testing/store.stub';
import { Store } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UnsupportedPageComponent', () => {
  let component: UnsupportedPageComponent;
  let fixture: ComponentFixture<UnsupportedPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnsupportedPageComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(UnsupportedPageComponent);
    component = fixture.componentInstance;
    component.ads = { index: 3 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
