import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesGraphComponent } from './lines-graph.component';

describe('LinesGraphComponent', () => {
  let component: LinesGraphComponent;
  let fixture: ComponentFixture<LinesGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinesGraphComponent]
    });
    fixture = TestBed.createComponent(LinesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
