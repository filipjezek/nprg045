import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StimulusListComponent } from './stimulus-list.component';

describe('StimulusListComponent', () => {
  let component: StimulusListComponent;
  let fixture: ComponentFixture<StimulusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StimulusListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StimulusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
