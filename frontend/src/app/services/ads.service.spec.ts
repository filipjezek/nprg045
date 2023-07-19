import { Subject, of } from 'rxjs';
import { AdsService } from './ads.service';
import { HttpService } from './http.service';
import { StoreStub } from '../testing/store.stub';
import { State } from '../store/reducers';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngrx/store';

describe('AdsService', () => {
  let service: AdsService;
  let httpStub: jasmine.SpyObj<HttpService>;
  let store: StoreStub<State>;
  const unsub = new Subject<void>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: jasmine.createSpyObj('httpStub', ['get', 'consumeStream']),
        },
        { provide: Store, useClass: StoreStub },
      ],
    });
    service = TestBed.inject(AdsService);
    httpStub = TestBed.inject(HttpService) as any;
    store = TestBed.inject(Store) as any;
  });

  afterEach(() => {
    unsub.next();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all ads', () => {
    const ads = [{ id: 1 }, { id: 2 }];
    httpStub.get.and.returnValue(of(ads));

    let loaded: any[];
    service.loadAds('path').subscribe((a) => (loaded = a));
    expect(httpStub.get).toHaveBeenCalledWith(
      'analysis_ds/all',
      jasmine.anything()
    );
    expect(loaded).toEqual(ads);
  });

  it('should load specific ads', () => {
    const ads = { id: 1 };
    httpStub.get.and.returnValue(of(ads));

    let loaded: any;
    service.loadSpecificAds('path', ads as any).subscribe((a) => (loaded = a));
    expect(httpStub.get).toHaveBeenCalledWith(
      'analysis_ds',
      jasmine.anything()
    );
    expect(loaded).toEqual(ads);
  });

  it('should follow links', fakeAsync(() => {
    const ads = {
      id: 1,
      foo: { '@link': 'mylink/1', dimensions: [3] },
      bar: { baz: { '@link': 'mylink/3', dimensions: [2, 4] } },
      cat: [{ '@link': 'mylink/17', dimensions: [1, 1, 1] }],
    };
    httpStub.get.and.returnValue(of(ads));

    const csvSubj = {
      'mylink/1': new Subject(),
      'mylink/3': new Subject(),
      'mylink/17': new Subject(),
    };
    httpStub.consumeStream.and.callFake((url) => {
      return (csvSubj as any)[url];
    });
    let loaded: any;

    service
      .loadSpecificAds('path', {} as any)
      .subscribe((val) => (loaded = val));

    tick();
    csvSubj['mylink/1'].next('1,2,3');
    csvSubj['mylink/1'].complete();
    tick();
    csvSubj['mylink/3'].next('1,2\n3,14,5\n6,72,8');
    csvSubj['mylink/3'].complete();
    tick();
    csvSubj['mylink/17'].next('9');
    csvSubj['mylink/17'].complete();
    tick();
    expect(loaded).toEqual({
      id: 1,
      foo: [1, 2, 3],
      bar: {
        baz: [
          [1, 2, 3, 14],
          [5, 6, 72, 8],
        ],
      },
      cat: [[[[9]]]],
    });
  }));
});
