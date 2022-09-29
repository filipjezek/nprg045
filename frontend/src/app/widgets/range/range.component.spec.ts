import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeComponent } from './range.component';

@Pipe({ name: 'scientific' })
class FakeScientificPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return value;
  }
}

describe('RangeComponent', () => {
  let component: RangeComponent;
  let fixture: ComponentFixture<RangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RangeComponent, FakeScientificPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
