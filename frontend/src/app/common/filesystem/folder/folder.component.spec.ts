import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderComponent } from './folder.component';

describe('FolderComponent', () => {
  let component: FolderComponent;
  let fixture: ComponentFixture<FolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FolderComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderComponent);
    component = fixture.componentInstance;
    component.info = { content: [], datastore: false, name: 'testfolder' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
