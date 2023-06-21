import { Injectable, Inject, ElementRef } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { promiseTimeout } from '../utils/promise-timeout';
import { GlobalEventService } from './global-event.service';
import { Store } from '@ngrx/store';
import { State } from '../store/reducers';
import { openOverlay, closeOverlay } from '../store/actions/ui.actions';
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
  private overlays: { zIndex: number; opacity?: number }[] = [];
  private closed = new Subject<HTMLElement>();
  private initialOverlay: {
    // in case there was already overlay present on page
    open: boolean;
    zIndex: number;
    opacity: number;
  };
  private bodyScrollPos: number; // in order to prevent scrolling of the whole page underneath

  public get openCount(): number {
    return this.dEls.length;
  }

  constructor(
    globalS: GlobalEventService,
    private store: Store<State>,
    @Inject(DOCUMENT) private doc: Document
  ) {
    merge(globalS.escapePressed, globalS.overlayClicked)
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
    implicitlyClosable = true,
    overlay?: { zIndex?: number; opacity?: number }
  ): NgElement & WithProperties<T> {
    const ref = this.openUnattached(el, implicitlyClosable, overlay);
    ref.attach();
    delete ref.attach;

    return ref;
  }

  openUnattached<T extends DialogClass>(
    el: (new (el: ElementRef, ...args: any[]) => T) & { selector: string },
    implicitlyClosable = true,
    overlay?: { zIndex?: number; opacity?: number }
  ): NgElement & WithProperties<T> & { attach: () => void } {
    if (this.dEls.length === 0) {
      this.store
        .select((x) => x.ui.overlay)
        .pipe(take(1))
        .subscribe((x) => (this.initialOverlay = x));

      this.bodyScrollPos = this.doc.body.getBoundingClientRect().top;
      this.doc.body.style.position = 'fixed';
      this.doc.body.style.top = `${this.bodyScrollPos}px`;
    }

    const overlayZIndex =
      overlay?.zIndex ||
      (this.overlays[this.overlays.length - 1]?.zIndex || 3) + 2;
    this.store.dispatch(
      openOverlay({ overlay: { ...overlay, zIndex: overlayZIndex } })
    );
    const dialogEl: NgElement & WithProperties<T> & { attach: () => void } =
      this.doc.createElement(el.selector) as any;
    dialogEl.setAttribute('tabindex', '-1');
    dialogEl.style.position = 'fixed';
    dialogEl.style.left = '50%';
    dialogEl.style.transform = 'translate(-50%, -50%)';
    dialogEl.style.top = '50%';
    dialogEl.style.zIndex = overlayZIndex + 1 + '';
    dialogEl.style.maxHeight = 'calc(95% - 100px)';
    dialogEl.style.overflowY = 'auto';
    dialogEl.style.overflowX = 'hidden';

    dialogEl.attach = () => {
      this.doc.body.appendChild(dialogEl);
      dialogEl.focus();
      dialogEl.removeAttribute('tabindex');
      this.overlays.push({ ...overlay, zIndex: overlayZIndex });
      this.dEls.push({
        el: dialogEl,
        implicitlyClosable: implicitlyClosable,
      });
    };
    return dialogEl;
  }

  async close(): Promise<void> {
    if (!this.dEls.length) {
      return null;
    }
    const current = this.dEls[this.dEls.length - 1];
    this.closed.next(current.el);
    current.el.setAttribute('animation-prop', 'closing');
    await promiseTimeout(this.dEls.length ? 150 : 120);
    this.doc.body.removeChild(current.el);
    this.dEls.pop();

    if (this.dEls.length === 0) {
      this.overlays.pop();
      if (!this.initialOverlay.open) {
        this.store.dispatch(closeOverlay());
      } else {
        this.store.dispatch(
          openOverlay({
            overlay: {
              zIndex: this.initialOverlay.zIndex,
              opacity: this.initialOverlay.opacity,
            },
          })
        );
      }
      this.doc.body.style.position = null;
      this.doc.body.style.top = null;
      this.doc.body.style.paddingRight = null;
      window.scrollTo(0, -this.bodyScrollPos);
    } else {
      this.store.dispatch(
        openOverlay({
          overlay: {
            ...this.overlays.pop(),
          },
        })
      );
    }
  }

  async closeAll() {
    while (this.dEls.length) {
      await this.close();
    }
  }
}
