import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { StoreStub } from './testing/store.stub';
import { loadFilesystem } from './store/actions/filesystem.actions';
import { State } from './store/reducers';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;
  let storeStub: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Store, useClass: StoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    storeStub = <any>TestBed.inject(Store);
    storeStub.subject.next({
      ui: { overlay: { opacity: 0, zIndex: 1, open: false } },
    });
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load filesystem on init', () => {
    fixture.detectChanges();
    expect(storeStub.dispatch).toHaveBeenCalled();
    expect(storeStub.dispatch.calls.mostRecent().args).toEqual([
      loadFilesystem(),
    ]);
  });
});
