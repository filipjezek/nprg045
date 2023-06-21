import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkTrackerComponent } from './network-tracker.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { State } from 'src/app/store/reducers';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TimePipe } from 'src/app/widgets/pipes/time.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { requestCancel } from 'src/app/store/actions/network.actions';

describe('NetworkTrackerComponent', () => {
  let component: NetworkTrackerComponent;
  let fixture: ComponentFixture<NetworkTrackerComponent>;
  let store: StoreStub<State>;
  let el: HTMLElement;

  beforeEach(async () => {
    jasmine.clock().install();
    await TestBed.configureTestingModule({
      declarations: [NetworkTrackerComponent, TimePipe],
      providers: [{ provide: Store, useClass: StoreStub }],
      imports: [NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkTrackerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as any;
    store.subject.next({
      net: {
        requests: [
          { id: 0, method: 'GET', retries: 2, start: +new Date(), url: '' },
          { id: 1, method: 'POST', retries: 1, start: +new Date(), url: '' },
          { id: 2, method: 'POST', retries: 0, start: +new Date(), url: '' },
        ],
      },
    });
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display active request duration', () => {
    jasmine.clock().mockDate();
    const timeEl = el.querySelector('.duration');
    expect(timeEl.textContent).toBe('0:00');
    jasmine.clock().tick(1000);
    fixture.detectChanges();
    expect(timeEl.textContent).toBe('0:01');
  });

  it('should cancel requests', () => {
    el.querySelector<HTMLElement>('.cancel').click();
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(requestCancel({ id: 0 }));
  });
});
