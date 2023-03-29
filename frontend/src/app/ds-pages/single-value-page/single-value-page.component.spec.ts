import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleValuePageComponent } from './single-value-page.component';

describe('SingleValuePageComponent', () => {
  let component: SingleValuePageComponent;
  let fixture: ComponentFixture<SingleValuePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleValuePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleValuePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
