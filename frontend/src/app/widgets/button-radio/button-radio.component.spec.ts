import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ButtonRadioComponent, RadioOption } from './button-radio.component';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  template: `<mozaik-button-radio
    [options]="items"
    [formControl]="control"
  ></mozaik-button-radio>`,
})
class Container {
  control = new FormControl('d');
  items: RadioOption[] = [
    { label: 'a', value: 'b' },
    { label: 'c', value: 'd' },
    { label: 'e', value: 'f' },
  ];
}

describe('ButtonRadioComponent', () => {
  let component: Container;
  let fixture: ComponentFixture<Container>;
  let el: HTMLElement;
  let buttons: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonRadioComponent, Container],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Container);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    buttons = Array.from(el.querySelectorAll('label'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display buttons', () => {
    expect(buttons.length).toBe(3);
    ['a', 'c', 'e'].forEach((text, i) =>
      expect(buttons[i].textContent.trim()).toBe(text)
    );
  });

  it('should change value on click', () => {
    expect(component.control.value).toBe('d');
    ['b', 'd', 'f'].forEach((val, i) => {
      buttons[i].click();
      fixture.detectChanges();
      expect(component.control.value).toBe(val);
    });
  });
});
