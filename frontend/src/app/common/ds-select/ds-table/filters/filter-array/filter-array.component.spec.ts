import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterArrayComponent } from './filter-array.component';

describe('FilterArrayComponent', () => {
  let component: FilterArrayComponent;
  let fixture: ComponentFixture<FilterArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterArrayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
