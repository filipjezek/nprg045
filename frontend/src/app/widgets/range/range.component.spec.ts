import { Component, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeComponent } from './range.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Pipe({ name: 'scientific' })
class FakeScientificPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return value;
  }
}

@Component({
  template: `
    <mozaik-range [min]="10" [max]="100" [formControl]="control"></mozaik-range>
  `,
})
class Container {
  control = new FormControl();
}

describe('RangeComponent', () => {
  let component: Container;
  let fixture: ComponentFixture<Container>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RangeComponent, FakeScientificPipe, Container],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Container);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change value with range input', () => {
    const inp = el.querySelector<HTMLInputElement>('[type=range]');
    inp.value = '20';
    inp.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.control.value).toBe(20);
  });
  it('should change value with number input', () => {
    const inp = el.querySelector<HTMLInputElement>('[type=number]');
    inp.value = '30';
    inp.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.control.value).toBe(30);
  });
});
