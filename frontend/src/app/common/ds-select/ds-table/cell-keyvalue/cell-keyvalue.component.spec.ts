import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellKeyvalueComponent } from './cell-keyvalue.component';

describe('CellKeyvalueComponent', () => {
  let component: CellKeyvalueComponent;
  let fixture: ComponentFixture<CellKeyvalueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellKeyvalueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellKeyvalueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
