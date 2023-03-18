import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellListComponent } from './cell-list.component';

describe('CellListComponent', () => {
  let component: CellListComponent;
  let fixture: ComponentFixture<CellListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
