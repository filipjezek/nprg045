import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsLoadingComponent } from './ads-loading.component';

describe('AdsLoadingComponent', () => {
  let component: AdsLoadingComponent;
  let fixture: ComponentFixture<AdsLoadingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdsLoadingComponent]
    });
    fixture = TestBed.createComponent(AdsLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
