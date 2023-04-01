import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBagComponent } from './property-bag.component';

describe('PropertyBagComponent', () => {
  let component: PropertyBagComponent;
  let fixture: ComponentFixture<PropertyBagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyBagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyBagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
