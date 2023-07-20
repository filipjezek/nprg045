import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellLinkComponent } from './cell-link.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { DSCELL_VAL } from '../cell-generic/cell-generic.component';
import { LinkWrapper } from '../../sql/user-sql-functions/make-link';
import { RouterLinkStub } from 'src/app/testing/routerlink.stub';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterStub } from 'src/app/testing/router.stub';

describe('CellLinkComponent', () => {
  let component: CellLinkComponent;
  let fixture: ComponentFixture<CellLinkComponent>;

  beforeEach(async () => {
    spyOn(routerSelectors, 'selectRouteParams').and.returnValue({
      ready: '1,2,3',
      viewing: '1',
    });
    spyOn(routerSelectors, 'selectRouteParam').and.returnValue(
      (() => 'testpath') as any
    );
    await TestBed.configureTestingModule({
      declarations: [CellLinkComponent, RouterLinkStub],
      providers: [
        { provide: Store, useClass: StoreStub },
        { provide: DSCELL_VAL, useValue: new LinkWrapper(12) },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CellLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create correct link', () => {
    const routerlink = fixture.debugElement
      .query(By.directive(RouterLinkStub))
      .injector.get(RouterLinkStub);
    expect(routerlink.routerLink).toEqual([
      'datastore',
      'testpath',
      'inspect',
      {
        ready: ['1', '2', '3', '12'],
        viewing: ['12'],
      },
    ]);
  });

  it('should open in background on middle click', () => {
    const router: RouterStub = TestBed.inject(Router) as any;
    const link: HTMLElement = fixture.nativeElement.querySelector('a');
    link.dispatchEvent(new MouseEvent('auxclick', { button: 1 }));
    expect(router.navigate).toHaveBeenCalledWith([
      'datastore',
      'testpath',
      'inspect',
      {
        ready: ['1', '2', '3', '12'],
        viewing: ['1'],
      },
    ]);
  });
});
