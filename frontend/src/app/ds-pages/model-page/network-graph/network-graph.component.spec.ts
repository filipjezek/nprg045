import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PNVNetworkGraphComponent } from './network-graph.component';

describe('NetworkGraphComponent', () => {
  let component: PNVNetworkGraphComponent;
  let fixture: ComponentFixture<PNVNetworkGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PNVNetworkGraphComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PNVNetworkGraphComponent);
    component = fixture.componentInstance;
    component.nodes = [];
    component.allNodes = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
