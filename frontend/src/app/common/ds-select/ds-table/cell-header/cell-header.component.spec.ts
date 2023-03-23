import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellHeaderComponent } from './cell-header.component';

describe('CellHeaderComponent', () => {
  let component: CellHeaderComponent;
  let fixture: ComponentFixture<CellHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
