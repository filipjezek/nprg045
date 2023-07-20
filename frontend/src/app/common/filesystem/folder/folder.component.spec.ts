import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderComponent } from './folder.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { State } from 'src/app/store/reducers';
import {
  loadDirectory,
  loadRecursiveFilesystem,
  toggleDirectory,
} from 'src/app/store/actions/filesystem.actions';

describe('FolderComponent', () => {
  let component: FolderComponent;
  let fixture: ComponentFixture<FolderComponent>;
  let el: HTMLElement;
  let store: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FolderComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderComponent);
    component = fixture.componentInstance;
    component.info = { content: [], datastore: false, name: 'testfolder' };
    component.context = '/foo';
    fixture.detectChanges();
    store = TestBed.inject(Store) as any;
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle folder', () => {
    const header = el.querySelector('header');
    header.click();
    expect(store.dispatch).toHaveBeenCalledWith(
      toggleDirectory({ open: true, path: '/foo/testfolder' })
    );
  });

  it('should load directory', () => {
    component.info = 'testfolder';
    fixture.detectChanges();
    const header = el.querySelector('header');
    header.click();
    expect(store.dispatch).toHaveBeenCalledWith(
      loadDirectory({ path: '/foo/testfolder' })
    );
  });

  it('should refresh', () => {
    store.dispatch.calls.reset();
    el.querySelector<HTMLElement>('[title=reload]').click();
    expect(store.dispatch).toHaveBeenCalledWith(
      loadDirectory({ path: '/foo/testfolder' })
    );
  });

  it('should load recursively', () => {
    store.dispatch.calls.reset();
    el.querySelector<HTMLElement>('[title="load recursively"]').click();
    expect(store.dispatch).toHaveBeenCalledWith(
      loadRecursiveFilesystem({ path: '/foo/testfolder' })
    );
  });
});
