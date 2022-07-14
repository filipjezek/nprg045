import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatastoreComponent } from './datastore.component';

describe('DatastoreComponent', () => {
  let component: DatastoreComponent;
  let fixture: ComponentFixture<DatastoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatastoreComponent ]
    })
    .compileComponents();
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
