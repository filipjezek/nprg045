import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { PNVNetworkGraphComponent } from './network-graph.component';
import { LassoFeatureFactory } from '../../common/network-graph/lasso.feature';
import { NetworkZoomFeatureFactory } from '../../common/network-graph/zoom.feature';
import { PNVFeatureFactory } from './pnv.feature';

describe('PNVNetworkGraphComponent', () => {
  let component: PNVNetworkGraphComponent;
  let fixture: ComponentFixture<PNVNetworkGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PNVNetworkGraphComponent],
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
        {
          provide: PNVFeatureFactory,
          useValue: {
            createPNVFeature: () =>
              jasmine.createSpyObj('NetworkZoomFeature', [
                'getColor',
                'setData',
                'filterPNV',
                'filterEdges',
                'redraw',
              ]),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(PNVNetworkGraphComponent);
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
