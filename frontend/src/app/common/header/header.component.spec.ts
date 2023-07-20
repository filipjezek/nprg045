import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { GlobalEventService } from 'src/app/services/global-event.service';
import { GlobalEventServiceStub } from 'src/app/testing/global-event.service.stub';
import { State } from 'src/app/store/reducers';
import { StoreStub } from 'src/app/testing/store.stub';

import { HeaderComponent } from './header.component';
import { NavigationEnd, Router } from '@angular/router';
import { RouterStub } from 'src/app/testing/router.stub';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;
  let storeStub: StoreStub<State>;
  let routerStub: RouterStub;
  let gEventStub: GlobalEventServiceStub;
  let datastorePath: string = null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [NoopAnimationsModule],
      providers: [
        { provide: Store, useClass: StoreStub },
        { provide: GlobalEventService, useClass: GlobalEventServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    spyOn(routerSelectors, 'selectRouteParam').and.returnValue(
      (() => datastorePath) as any
    );
    fixture = TestBed.createComponent(HeaderComponent);
    storeStub = TestBed.inject(Store) as any;
    routerStub = TestBed.inject(Router) as any;
    gEventStub = TestBed.inject(GlobalEventService) as any;
    storeStub.subject.next({ fs: { datastores: null } });
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    (routerSelectors.selectRouteParam as jasmine.Spy).and.returnValue(
      () => 'testpath' as any
    );
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show menu when no datastore selected', fakeAsync(() => {
    fixture.detectChanges();
    routerStub.events.next(new NavigationEnd(0, 'url', 'url'));
    tick();
    expect(component.filesystemOpen).toBeFalsy(); // waiting for fs

    storeStub.subject.next({ fs: { datastores: {} } });
    tick();
    expect(component.filesystemOpen).toBeTruthy();

    gEventStub.subj.next({
      type: 'click:overlay',
      event: new Event('click'),
    });
    tick();
    expect(component.filesystemOpen).toBeTruthy();
  }));

  it('should toggle menu', fakeAsync(() => {
    datastorePath = 'testpath';
    storeStub.subject.next({ fs: { datastores: {} } });
    fixture.detectChanges();
    routerStub.events.next(new NavigationEnd(0, 'url', 'url'));
    expect(component.filesystemOpen).toBeFalsy();

    el.querySelector('button').click();
    fixture.detectChanges();
    tick();
    expect(component.filesystemOpen).toBeTruthy();
    datastorePath = null;
  }));
});
