import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { Store } from '@ngrx/store';
import { StoreStub } from '../testing/store.stub';
import { DOCUMENT } from '@angular/common';
import { State } from '../store/reducers';
import { Component } from '@angular/core';
import { Dialog } from '../dialog';
import { GlobalEventServiceStub } from '../testing/global-event.service.stub';
import { GlobalEventService } from './global-event.service';

@Component({ template: '' })
class TestDialog extends Dialog {
  public static readonly selector = 'test-dialog';
}

@Component({ template: '' })
class TestDialogNested extends Dialog {
  public static readonly selector = 'test-dialog-nested';
}

describe('DialogService', () => {
  let service: DialogService;
  let doc: Document;
  let store: StoreStub<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store,
          useClass: StoreStub,
        },
        {
          provide: GlobalEventService,
          useClass: GlobalEventServiceStub,
        },
      ],
    });
    store = TestBed.inject(Store) as any;
    store.subject.next({
      ui: { overlay: { open: false, opacity: 0.7, zIndex: 3 } },
    });
    service = TestBed.inject(DialogService);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    doc
      .querySelectorAll('test-dialog, test-dialog-nested')
      .forEach((td) => td.remove());
  });

  it('should open a dialog', fakeAsync(() => {
    service.open(TestDialog);
    tick();
    expect(doc.querySelector('test-dialog')).toBeTruthy();
  }));

  it('should open an unattached dialog', fakeAsync(() => {
    const ref = service.openUnattached(TestDialog);
    tick();
    expect(doc.querySelector('test-dialog')).toBeNull();
    ref.attach();
    tick();
    expect(doc.querySelector('test-dialog')).toBeTruthy();
  }));

  describe('closing dialog', () => {
    let gEventS: GlobalEventServiceStub;

    beforeEach(() => {
      gEventS = TestBed.inject(GlobalEventService) as any;
    });

    it('should close', fakeAsync(() => {
      service.open(TestDialog);
      tick();
      service.close();
      flush();
      expect(doc.querySelector('test-dialog')).toBeNull();
    }));
    it('should close on escape', fakeAsync(() => {
      service.open(TestDialog);
      tick();
      gEventS.subj.next({ type: 'key:escape', event: {} });
      flush();
      expect(doc.querySelector('test-dialog')).toBeNull();
    }));
    it('should close on overlay click', fakeAsync(() => {
      service.open(TestDialog);
      tick();
      gEventS.subj.next({ type: 'click:overlay', event: {} });
      flush();
      expect(doc.querySelector('test-dialog')).toBeNull();
    }));
    it('should not close on overlay click when not implicitly closable', fakeAsync(() => {
      service.open(TestDialog, false);
      tick();
      gEventS.subj.next({ type: 'key:escape', event: {} });
      flush();
      expect(doc.querySelector('test-dialog')).toBeTruthy();
    }));
    it('should not close on escape when not implicitly closable', fakeAsync(() => {
      service.open(TestDialog, false);
      tick();
      gEventS.subj.next({ type: 'click:overlay', event: {} });
      flush();
      expect(doc.querySelector('test-dialog')).toBeTruthy();
    }));
    it('should close when implicitly closable', fakeAsync(() => {
      service.open(TestDialog, false);
      tick();
      service.close();
      flush();
      expect(doc.querySelector('test-dialog')).toBeNull();
    }));
  });

  describe('nested dialogs', () => {
    it('should open', fakeAsync(() => {
      service.open(TestDialog);
      tick();
      service.open(TestDialogNested);
      tick();
      const td = doc.querySelector<HTMLElement>('test-dialog');
      const tdn = doc.querySelector<HTMLElement>('test-dialog-nested');
      expect(td).toBeTruthy();
      expect(tdn).toBeTruthy();
      expect(+getComputedStyle(td).zIndex).toBeLessThan(
        +getComputedStyle(tdn).zIndex
      );
    }));

    it('should close', fakeAsync(() => {
      service.open(TestDialog);
      tick();
      service.open(TestDialogNested);
      tick();
      service.close();
      flush();
      expect(doc.querySelector('test-dialog')).toBeTruthy();
      expect(doc.querySelector('test-dialog-nested')).toBeNull();
    }));

    it('should close all', fakeAsync(() => {
      service.open(TestDialog);
      tick();
      service.open(TestDialogNested);
      tick();
      service.closeAll();
      flush();
      expect(doc.querySelector('test-dialog')).toBeNull();
      expect(doc.querySelector('test-dialog-nested')).toBeNull();
    }));
  });
});
