import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterEnumComponent } from './filter-enum.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterEnumComponent', () => {
  let component: FilterEnumComponent;
  let fixture: ComponentFixture<FilterEnumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterEnumComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterEnumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
