import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkGraphComponent } from './network-graph.component';

describe('NetworkGraphComponent', () => {
  let component: NetworkGraphComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkGraphComponent],
    });
    component = TestBed.inject(NetworkGraphComponent);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
