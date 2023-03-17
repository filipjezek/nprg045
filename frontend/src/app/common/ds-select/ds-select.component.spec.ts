import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsSelectComponent } from './ds-select.component';

describe('DsSelectComponent', () => {
  let component: DsSelectComponent;
  let fixture: ComponentFixture<DsSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
