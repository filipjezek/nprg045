import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsupportedPageComponent } from './unsupported-page.component';

describe('UnsupportedPageComponent', () => {
  let component: UnsupportedPageComponent;
  let fixture: ComponentFixture<UnsupportedPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnsupportedPageComponent]
    });
    fixture = TestBed.createComponent(UnsupportedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
