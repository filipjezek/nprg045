import { Injectable, Inject, ElementRef } from '@angular/core';
import { Subject, merge, BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { promiseTimeout } from '../utils/promise-timeout';
import { GlobalEventService } from './global-event.service';
import { DOCUMENT } from '@angular/common';
import { NgElement, WithProperties } from '@angular/elements';
import { Dialog as DialogClass } from '../dialog';

interface Dialog {
  el: HTMLElement;
  implicitlyClosable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dEls: Dialog[] = [];
  private closed = new Subject<HTMLElement>();
  private bodyScrollPos: number; // in order to prevent scrolling of the whole page underneath
  private showOverlaySubj = new BehaviorSubject<boolean>(false);

  public get openCount(): number {
    return this.dEls.length;
  }
  public showOverlay$ = this.showOverlaySubj.asObservable();

  constructor(
    globalS: GlobalEventService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    merge(
      globalS.escapePressed,
      globalS.documentClicked.pipe(
        filter(
          (e) => !!(e.target as HTMLElement).tagName.match(/^mozaik-overlay$/i)
        )
      )
    )
      .pipe(
        filter(
          () =>
            this.dEls.length &&
            this.dEls[this.dEls.length - 1].implicitlyClosable
        )
      )
      .subscribe(() => this.close());
  }

  open<T extends DialogClass>(
    el: (new (el: ElementRef, ...args: any[]) => T) & { selector: string },
    implicitlyClosable = true
  ): NgElement & WithProperties<T> {
    const ref = this.openUnattached(el, implicitlyClosable);
    ref.attach();
    delete ref.attach;

    return ref;
  }

  openUnattached<T extends DialogClass>(
    el: (new (el: ElementRef, ...args: any[]) => T) & { selector: string },
    implicitlyClosable = true
  ): NgElement & WithProperties<T> & { attach: () => void } {
    if (this.dEls.length === 0) {
      this.bodyScrollPos = this.doc.body.getBoundingClientRect().top;
      this.doc.body.style.position = 'fixed';
      this.doc.body.style.top = `${this.bodyScrollPos}px`;
    }

    this.showOverlaySubj.next(true);
    const dialogEl: NgElement & WithProperties<T> & { attach: () => void } =
      this.doc.createElement(el.selector) as any;
    dialogEl.setAttribute('tabindex', '-1');
    dialogEl.style.position = 'fixed';
    dialogEl.style.left = '50%';
    dialogEl.style.transform = 'translate(-50%, -50%)';
    dialogEl.style.top = '50%';
    dialogEl.style.zIndex = this.dEls.length * 2 + 6 + '';
    dialogEl.style.maxHeight = '95%';
    dialogEl.style.overflowY = 'auto';
    dialogEl.style.overflowX = 'hidden';

    dialogEl.attach = () => {
      this.doc.body.appendChild(dialogEl);
      dialogEl.focus();
      dialogEl.removeAttribute('tabindex');
      this.dEls.push({
        el: dialogEl,
        implicitlyClosable,
      });
    };
    return dialogEl;
  }

  async close() {
    if (!this.dEls.length) {
      return;
    }
    const current = this.dEls[this.dEls.length - 1];
    this.closed.next(current.el);
    current.el.setAttribute('animation-prop', 'closing');
    await promiseTimeout(this.dEls.length ? 150 : 120);
    this.doc.body.removeChild(current.el);
    this.dEls.pop();

    if (this.dEls.length === 0) {
      this.showOverlaySubj.next(false);
      this.doc.body.style.position = null;
      this.doc.body.style.top = null;
      window.scrollTo(0, -this.bodyScrollPos);
    }
  }

  async closeAll() {
    while (this.dEls.length) {
      await this.close();
    }
  }
}
