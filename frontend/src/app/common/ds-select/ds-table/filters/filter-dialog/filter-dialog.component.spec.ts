import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDialogComponent } from './filter-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PurefnPipe } from 'src/app/widgets/pipes/purefn.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterDialogComponent', () => {
  let component: FilterDialogComponent;
  let fixture: ComponentFixture<FilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterDialogComponent, PurefnPipe],
      imports: [NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
