import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { Subject, takeUntil } from 'rxjs';
import { RouterLinkStub } from 'src/app/testing/routerlink.stub';
import { By } from '@angular/platform-browser';

fdescribe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;
  let currPage: number;
  const end = new Subject();
  let el: HTMLElement;
  const assertPage = (page: number) => {
    expect(currPage).toBe(page);
  };
  let anchors: HTMLAnchorElement[];
  let routerlinks: RouterLinkStub[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationComponent, RouterLinkStub],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.max = 10;
    component.paginate
      .pipe(takeUntil(end))
      .subscribe((val) => (currPage = val));
    component.urlParams = { foo: 'bar' };
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  afterEach(() => {
    end.next(null);
    end.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hard links', () => {
    beforeEach(() => {
      component.current = 1;
      component.baseUrl = '/test';
      fixture.detectChanges();
      anchors = Array.from(el.querySelectorAll('a'));
      routerlinks = fixture.debugElement
        .queryAll(By.directive(RouterLinkStub))
        .map((de) => de.injector.get(RouterLinkStub));
    });

    it('should notify with events', () => {
      anchors[0].click();
      fixture.detectChanges();
      assertPage(1);

      anchors[1].click();
      fixture.detectChanges();
      assertPage(2);

      anchors[anchors.length - 1].click();
      fixture.detectChanges();
      assertPage(10);
    });
    it('should trigger correct link', () => {
      expect(routerlinks[0].routerLink).toEqual(['/test', { foo: 'bar' }]);
      expect(routerlinks[1].routerLink).toEqual(['/test', 2, { foo: 'bar' }]);
      expect(routerlinks[routerlinks.length - 1].routerLink).toEqual([
        '/test',
        10,
        { foo: 'bar' },
      ]);
    });
  });

  describe('link params', () => {
    beforeEach(() => {
      component.current = 1;
      component.baseUrl = '/test';
      component.baseParam = 'page';
      fixture.detectChanges();
      anchors = Array.from(el.querySelectorAll('a'));
      routerlinks = fixture.debugElement
        .queryAll(By.directive(RouterLinkStub))
        .map((de) => de.injector.get(RouterLinkStub));
    });
    it('should notify with events', () => {
      anchors[0].click();
      fixture.detectChanges();
      assertPage(1);

      anchors[1].click();
      fixture.detectChanges();
      assertPage(2);

      anchors[anchors.length - 1].click();
      fixture.detectChanges();
      assertPage(10);
    });
    it('should trigger correct link', () => {
      expect(routerlinks[0].routerLink).toEqual(['/test', { foo: 'bar' }]);
      expect(routerlinks[1].routerLink).toEqual([
        '/test',
        { foo: 'bar', page: 2 },
      ]);
      expect(routerlinks[routerlinks.length - 1].routerLink).toEqual([
        '/test',
        { foo: 'bar', page: 10 },
      ]);
    });
  });

  describe('buttons only', () => {
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
      component.current = 1;
      fixture.detectChanges();
      buttons = Array.from(el.querySelectorAll('button'));
      routerlinks = fixture.debugElement
        .queryAll(By.directive(RouterLinkStub))
        .map((de) => de.injector.get(RouterLinkStub));
    });
    it('should notify with events', () => {
      buttons[0].click();
      fixture.detectChanges();
      assertPage(1);

      buttons[1].click();
      fixture.detectChanges();
      assertPage(2);

      buttons[buttons.length - 1].click();
      fixture.detectChanges();
      assertPage(10);
    });
    it('should not create any link', () => {
      expect(routerlinks.length).toBe(0);
    });
  });
});
