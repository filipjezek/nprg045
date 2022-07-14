import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesystemComponent } from './filesystem.component';

describe('FilesystemComponent', () => {
  let component: FilesystemComponent;
  let fixture: ComponentFixture<FilesystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
