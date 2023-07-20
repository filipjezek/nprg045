import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterStringComponent } from './filter-string.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterStringComponent', () => {
  let component: FilterStringComponent;
  let fixture: ComponentFixture<FilterStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterStringComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
