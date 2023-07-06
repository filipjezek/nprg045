import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AslPageComponent } from './asl-page.component';

describe('AslPageComponent', () => {
  let component: AslPageComponent;
  let fixture: ComponentFixture<AslPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AslPageComponent]
    });
    fixture = TestBed.createComponent(AslPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
