import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterArrayComponent } from './filter-array.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterArrayComponent', () => {
  let component: FilterArrayComponent;
  let fixture: ComponentFixture<FilterArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterArrayComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
