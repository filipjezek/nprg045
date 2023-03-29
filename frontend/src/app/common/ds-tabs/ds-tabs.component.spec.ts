import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsTabsComponent } from './ds-tabs.component';

describe('DsTabsComponent', () => {
  let component: DsTabsComponent;
  let fixture: ComponentFixture<DsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
