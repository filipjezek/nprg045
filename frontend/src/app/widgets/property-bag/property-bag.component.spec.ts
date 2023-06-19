import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBagComponent } from './property-bag.component';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PurefnPipe } from '../pipes/purefn.pipe';

@Component({
  template: `
    <mozaik-property-bag
      [formControl]="control"
      [bag]="items"
    ></mozaik-property-bag>
  `,
})
class Container {
  control = new FormControl();
  items = {
    foo: 'bar',
    baz: 'cat',
  };
}

describe('PropertyBagComponent', () => {
  let component: Container;
  let fixture: ComponentFixture<Container>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PropertyBagComponent, Container, PurefnPipe],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Container);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should work as a radio input', () => {
    expect(component.control.value).toBeNull();
    const items = Array.from(el.querySelectorAll<HTMLElement>('.item'));

    items.find((it) => it.textContent.trim() == 'foo').click();
    fixture.detectChanges();
    expect(component.control.value).toBe('foo');
    items.find((it) => it.textContent.trim() == 'baz').click();
    fixture.detectChanges();
    expect(component.control.value).toBe('baz');
  });
});
