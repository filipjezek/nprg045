import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNeuronComponent } from './add-neuron.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddNeuronComponent', () => {
  let component: AddNeuronComponent;
  let fixture: ComponentFixture<AddNeuronComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNeuronComponent],
      imports: [NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AddNeuronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
