import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixComponent } from './matrix.component';
import { MatrixZoomFeatureFactory } from './zoom.feature';

describe('MatrixComponent', () => {
  let component: MatrixComponent;
  let fixture: ComponentFixture<MatrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatrixComponent],
      providers: [
        {
          provide: MatrixZoomFeatureFactory,
          useValue: {
            createZoomFeature: () =>
              jasmine.createSpyObj('MatrixZoomFeature', []),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(MatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
