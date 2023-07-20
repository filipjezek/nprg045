import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlHelpComponent } from './sql-help.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SqlHelpComponent', () => {
  let component: SqlHelpComponent;
  let fixture: ComponentFixture<SqlHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SqlHelpComponent],
      imports: [NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SqlHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
