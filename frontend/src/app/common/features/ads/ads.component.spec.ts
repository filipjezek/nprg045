import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdsIdentifier } from 'src/app/store/reducers/ads.reducer';
import { AcronymPipe } from 'src/app/widgets/pipes/acronym.pipe';

import { AdsComponent } from './ads.component';

describe('AdsComponent', () => {
  let component: AdsComponent;
  let fixture: ComponentFixture<AdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdsComponent, AcronymPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdsComponent);
    component = fixture.componentInstance;
    component.index = 0;
    component.data = {
      algorithm: 'testalgo',
      identifier: AdsIdentifier.PerNeuronPairValue,
      tags: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
