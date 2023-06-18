import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  template: `<mozaik-checkbox
    [formControl]="control"
    [labelPosition]="left ? 'left' : 'right'"
    >TEST</mozaik-checkbox
  >`,
})
class Container {
  control = new FormControl(false);
  left = true;
}

const findPrev = (el: Node, predicate: (el: Node) => boolean): Node =>
  predicate(el)
    ? el
    : el.previousSibling && findPrev(el.previousSibling, predicate);

const findNext = (el: Node, predicate: (el: Node) => boolean): Node =>
  predicate(el) ? el : el.nextSibling && findNext(el.nextSibling, predicate);

describe('CheckboxComponent', () => {
  let component: Container;
  let fixture: ComponentFixture<Container>;
  let el: HTMLElement;
  let box: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckboxComponent, Container],
      imports: [ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Container);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    box = el.querySelector('.box');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change value on click', () => {
    expect(component.control.value).toBe(false);
    box.click();
    fixture.detectChanges();
    expect(component.control.value).toBe(true);
    box.click();
    fixture.detectChanges();
    expect(component.control.value).toBe(false);
  });

  it('should display label on the left', () => {
    const contentLeft = findPrev(box, (el) => el instanceof Text) as Text;
    const contentRight = findNext(box, (el) => el instanceof Text) as Text;
    expect(contentRight).toBeNull();
    expect(contentLeft.textContent.trim()).toBe('TEST');
  });

  it('should display label on the right', () => {
    component.left = false;
    fixture.detectChanges();
    const contentLeft = findPrev(box, (el) => el instanceof Text) as Text;
    const contentRight = findNext(box, (el) => el instanceof Text) as Text;
    expect(contentLeft).toBeNull();
    expect(contentRight.textContent.trim()).toBe('TEST');
  });
});
