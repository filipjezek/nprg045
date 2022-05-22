import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedDataComponent } from './selected-data.component';

describe('SelectedDataComponent', () => {
  let component: SelectedDataComponent;
  let fixture: ComponentFixture<SelectedDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
