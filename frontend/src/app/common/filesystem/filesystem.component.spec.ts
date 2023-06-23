import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesystemComponent } from './filesystem.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilesystemComponent', () => {
  let component: FilesystemComponent;
  let fixture: ComponentFixture<FilesystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesystemComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesystemComponent);
    component = fixture.componentInstance;
    component.files = { content: [], datastore: false, name: 'testfs' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
