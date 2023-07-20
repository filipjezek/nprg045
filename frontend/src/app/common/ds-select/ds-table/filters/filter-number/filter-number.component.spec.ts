import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterNumberComponent } from './filter-number.component';
import { StoreStub } from 'src/app/testing/store.stub';
import { Store } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterNumberComponent', () => {
  let component: FilterNumberComponent;
  let fixture: ComponentFixture<FilterNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterNumberComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
