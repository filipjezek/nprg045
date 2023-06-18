import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterLinkStub } from 'src/app/testing/routerlink.stub';

@Component({
  selector: 'container',
  template: '<mozaik-button (click)="spy($event)">HELLO</mozaik-button>',
})
class TestContainer {
  spy = jasmine.createSpy('onclick');
}

describe('ButtonComponent', () => {
  let component: TestContainer;
  let button: ButtonComponent;
  let fixture: ComponentFixture<TestContainer>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent, TestContainer, RouterLinkStub],
    }).compileComponents();

    fixture = TestBed.createComponent(TestContainer);
    component = fixture.componentInstance;
    button = fixture.debugElement.query(
      By.directive(ButtonComponent)
    ).componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('routerlink', () => {
    beforeEach(() => {
      button.link = ['my', 'uri'];
      fixture.detectChanges();
    });

    it('should render as a link', () => {
      expect(el.querySelector('button')).toBeFalsy();
      expect(el.querySelector('a')).toBeTruthy();

      const rl: RouterLinkStub = fixture.debugElement
        .query(By.directive(RouterLinkStub))
        .injector.get(RouterLinkStub);
      expect(rl.routerLink).toEqual(['my', 'uri']);
    });

    it('should propagate onclick', () => {
      expect(component.spy).not.toHaveBeenCalled();
      el.querySelector<HTMLElement>('button, a').click();
      fixture.detectChanges();
      expect(component.spy).toHaveBeenCalledWith(jasmine.any(MouseEvent));
    });

    it('should not propagate onclick when disabled', () => {
      button.disabled = true;
      fixture.detectChanges();
      el.querySelector<HTMLElement>('button, a').click();
      fixture.detectChanges();
      expect(component.spy).not.toHaveBeenCalled();
    });
  });
  describe('plain', () => {
    it('should render as a button', () => {
      expect(el.querySelector('button')).toBeTruthy();
      expect(el.querySelector('a')).toBeFalsy();
    });

    it('should propagate onclick', () => {
      expect(component.spy).not.toHaveBeenCalled();
      el.querySelector<HTMLElement>('button, a').click();
      fixture.detectChanges();
      expect(component.spy).toHaveBeenCalledWith(jasmine.any(MouseEvent));
    });

    it('should not propagate onclick when disabled', () => {
      button.disabled = true;
      fixture.detectChanges();
      el.querySelector<HTMLElement>('button, a').click();
      fixture.detectChanges();
      expect(component.spy).not.toHaveBeenCalled();
    });
  });
});
