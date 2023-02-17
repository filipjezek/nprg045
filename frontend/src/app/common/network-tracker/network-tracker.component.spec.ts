import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkTrackerComponent } from './network-tracker.component';

describe('NetworkTrackerComponent', () => {
  let component: NetworkTrackerComponent;
  let fixture: ComponentFixture<NetworkTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetworkTrackerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
