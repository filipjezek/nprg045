import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesGraphComponent } from './lines-graph.component';
import { LinesZoomFeatureFactory } from './zoom.feature';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';

describe('LinesGraphComponent', () => {
  let component: LinesGraphComponent;
  let fixture: ComponentFixture<LinesGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinesGraphComponent],
      providers: [
        {
          provide: LinesZoomFeatureFactory,
          useValue: {
            createZoomFeature: () =>
              jasmine.createSpyObj('LinesZoomFeature', [
                'transformX',
                'transformY',
                'invertX',
                'invertY',
              ]),
          },
        },
        { provide: Store, useClass: StoreStub },
      ],
    });
    fixture = TestBed.createComponent(LinesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
