import { Directive, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { RouterLinkStub } from 'src/app/testing/routerlink.stub';
import { StoreStub } from 'src/app/testing/store.stub';

import { CategoryListComponent, WrapPipe } from './category-list.component';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let el: HTMLElement;
  let storeStub: StoreStub<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryListComponent, WrapPipe, RouterLinkStub],
      providers: [{ provide: Store, useClass: StoreStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    storeStub = <any>TestBed.inject(Store);
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display nothing when data empty', () => {
    component.data = [];
    component.header = 'foo';
    fixture.detectChanges();
    expect(el.textContent).toBe('');
  });

  it('should display links', () => {
    const data = ['hello', 'world', 'foo', 'bar'];
    component.data = [...data];
    component.param = 'testParam';
    component.labelTransform = (str, i) => str.toUpperCase() + i;
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.directive(RouterLinkStub));
    expect(links.length).toBe(4);

    const expectedTransformed = ['HELLO0', 'WORLD1', 'FOO2', 'BAR3'];

    links.forEach((link, i) => {
      expect(link.nativeElement.textContent.trim()).toEqual(
        expectedTransformed[i]
      );
      expect(link.injector.get(RouterLinkStub).queryParams).toEqual({
        testParam: expectedTransformed[i],
      });
    });
  });
});
