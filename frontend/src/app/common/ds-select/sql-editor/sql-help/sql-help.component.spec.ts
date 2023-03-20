import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlHelpComponent } from './sql-help.component';

describe('SqlHelpComponent', () => {
  let component: SqlHelpComponent;
  let fixture: ComponentFixture<SqlHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SqlHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SqlHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
