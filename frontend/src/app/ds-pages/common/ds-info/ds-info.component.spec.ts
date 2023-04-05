import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsInfoComponent } from './ds-info.component';

describe('DsInfoComponent', () => {
  let component: DsInfoComponent;
  let fixture: ComponentFixture<DsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
