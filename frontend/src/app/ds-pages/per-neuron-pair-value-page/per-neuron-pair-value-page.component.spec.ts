import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerNeuronPairValuePageComponent } from './per-neuron-pair-value-page.component';

describe('PerNeuronPairValuePageComponent', () => {
  let component: PerNeuronPairValuePageComponent;
  let fixture: ComponentFixture<PerNeuronPairValuePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerNeuronPairValuePageComponent]
    });
    fixture = TestBed.createComponent(PerNeuronPairValuePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
