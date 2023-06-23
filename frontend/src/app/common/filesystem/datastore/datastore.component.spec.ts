import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatastoreComponent } from './datastore.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DatastoreComponent', () => {
  let component: DatastoreComponent;
  let fixture: ComponentFixture<DatastoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatastoreComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatastoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
