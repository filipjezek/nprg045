import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsTabHandleComponent } from './ds-tab-handle.component';

describe('DsTabHandleComponent', () => {
  let component: DsTabHandleComponent;
  let fixture: ComponentFixture<DsTabHandleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsTabHandleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsTabHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
