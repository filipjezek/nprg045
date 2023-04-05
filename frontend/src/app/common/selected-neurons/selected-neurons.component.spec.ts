import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedNeuronsComponent } from './selected-neurons.component';

describe('SelectedNeuronsComponent', () => {
  let component: SelectedNeuronsComponent;
  let fixture: ComponentFixture<SelectedNeuronsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedNeuronsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedNeuronsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
