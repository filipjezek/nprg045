import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { CollapsibleComponent } from './collapsible.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  template: `<mozaik-collapsible>
    <span slot="header" class="test-header">heading</span>
    <p>test content</p>
  </mozaik-collapsible>`,
})
class Container {}

describe('CollapsibleComponent', () => {
  let component: Container;
  let fixture: ComponentFixture<Container>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollapsibleComponent, Container],
      imports: [NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Container);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide content', fakeAsync(() => {
    expect(el.querySelector('p')).toBeNull();
    el.querySelector('header').click();
    fixture.detectChanges();
    tick(); // because of animations
    const p = el.querySelector('p');
    expect(p.textContent).toBe('test content');
    el.querySelector('header').click();
    fixture.detectChanges();
    tick();
    expect(el.querySelector('p')).toBeNull();
  }));

  it('should display header', () => {
    expect(el.querySelector('header .test-header').textContent).toBe('heading');
  });
});
