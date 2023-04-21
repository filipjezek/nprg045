import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSwitchComponent } from './filter-switch.component';

describe('FilterSwitchComponent', () => {
  let component: FilterSwitchComponent;
  let fixture: ComponentFixture<FilterSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterSwitchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
