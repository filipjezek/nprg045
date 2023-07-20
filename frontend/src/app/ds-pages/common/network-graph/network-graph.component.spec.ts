import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkGraphComponent } from './network-graph.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { LassoFeatureFactory } from './lasso.feature';
import { NetworkZoomFeatureFactory } from './zoom.feature';

describe('NetworkGraphComponent', () => {
  let component: NetworkGraphComponent;
  let fixture: ComponentFixture<NetworkGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkGraphComponent],
      providers: [
        { provide: Store, useClass: StoreStub },
        {
          provide: LassoFeatureFactory,
          useValue: {
            createLassoFeature: () =>
              jasmine.createSpyObj('LassoFeature', ['rebind']),
          },
        },
        {
          provide: NetworkZoomFeatureFactory,
          useValue: {
            createZoomFeature: () =>
              jasmine.createSpyObj('NetworkZoomFeature', [
                'transformX',
                'transformY',
              ]),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(NetworkGraphComponent);
    component = fixture.componentInstance;
    component.allNodes = [];
    component.nodes = [];
    component.sheetName = '';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
