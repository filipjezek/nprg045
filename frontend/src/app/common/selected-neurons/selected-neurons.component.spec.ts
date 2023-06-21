import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedNeuronsComponent } from './selected-neurons.component';
import { PurefnPipe } from 'src/app/widgets/pipes/purefn.pipe';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';
import { State } from 'src/app/store/reducers';
import {
  addSelectedNodes,
  hoverNode,
  selectNodes,
} from 'src/app/store/actions/model.actions';
import { NetworkNode } from 'src/app/store/reducers/model.reducer';

@Component({
  template: `<ng-content></ng-content>`,
  selector: 'mozaik-collapsible',
})
class CollapsibleStub {}

fdescribe('SelectedNeuronsComponent', () => {
  let component: SelectedNeuronsComponent;
  let fixture: ComponentFixture<SelectedNeuronsComponent>;
  let store: StoreStub<State>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedNeuronsComponent, PurefnPipe, CollapsibleStub],
      providers: [{ provide: Store, useClass: StoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedNeuronsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as any;
    store.subject.next({
      model: {
        currentModel: {
          nodes: [],
          sheetNodes: {},
        },
        selected: [
          {
            id: 1,
            sheets: {
              a: {
                connections: [{ node: 12, sheet: 'b' }],
              },
            },
          },
          { id: 2, sheets: {} },
          { id: 3, sheets: {} },
        ],
        hovered: null,
      },
    });
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hover nodes', () => {
    const anchor = el.querySelector('.node-anchor');
    anchor.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(
      hoverNode({ node: jasmine.objectContaining({ id: 1 }) as any })
    );

    store.dispatch.calls.reset();
    anchor.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(hoverNode({ node: null }));
  });

  it('should select nodes', () => {
    const anchor = el.querySelector('.outgoing .node-anchor');
    anchor.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(selectNodes({ nodes: [12] }));
  });

  it('should select additional nodes', () => {
    const anchor = el.querySelector('.outgoing .node-anchor');
    anchor.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(
      addSelectedNodes({ nodes: [12] })
    );
  });
});
