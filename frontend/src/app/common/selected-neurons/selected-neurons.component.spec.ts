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
import { DialogService } from 'src/app/services/dialog.service';
import { AddNeuronComponent } from './add-neuron/add-neuron.component';

@Component({
  template: `<ng-content></ng-content>`,
  selector: 'mozaik-collapsible',
})
class CollapsibleStub {}
@Component({
  template: `<ng-content></ng-content>`,
  selector: 'mozaik-button',
})
class ButtonStub {}

describe('SelectedNeuronsComponent', () => {
  let component: SelectedNeuronsComponent;
  let fixture: ComponentFixture<SelectedNeuronsComponent>;
  let store: StoreStub<State>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SelectedNeuronsComponent,
        PurefnPipe,
        CollapsibleStub,
        ButtonStub,
      ],
      providers: [
        { provide: Store, useClass: StoreStub },
        {
          provide: DialogService,
          useValue: jasmine.createSpyObj('DialogService', ['open', 'close']),
        },
      ],
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

  describe('opening dialog', () => {
    let listener: (e: CustomEvent) => void;
    let dialogS: jasmine.SpyObj<DialogService>;
    beforeEach(() => {
      dialogS = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
      dialogS.open.and.returnValue({
        addEventListener: (type: string, cb: (e: CustomEvent) => void) => {
          if (type === 'value') {
            listener = cb;
          }
        },
      } as any);
      el.querySelector<HTMLElement>('mozaik-button').click();
      fixture.detectChanges();
    });

    it('should open the dialog', () => {
      expect(dialogS.open).toHaveBeenCalledWith(AddNeuronComponent);
    });
    it('should replace selection', () => {
      listener({ detail: { neuron: 123, replace: true } } as any);
      expect(store.dispatch).toHaveBeenCalledWith(
        selectNodes({ nodes: [123] })
      );
    });
    it('should add to selection', () => {
      listener({ detail: { neuron: 123, replace: false } } as any);
      expect(store.dispatch).toHaveBeenCalledWith(
        addSelectedNodes({ nodes: [123] })
      );
    });
  });
});
