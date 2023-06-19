import { Injectable, Inject } from '@angular/core';
import { Toast, ToastLevel } from './toast';
import { DOCUMENT } from '@angular/common';
import { promiseTimeout } from 'src/app/utils/promise-timeout';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: Toast[] = [];
  private currentToast: Toast;
  private toastTimeout: any;

  constructor(@Inject(DOCUMENT) private doc: Document) {}

  public add(t: Toast) {
    this.toasts.push(t);
    if (!this.currentToast) {
      this.show();
    }
  }

  private async show() {
    this.currentToast = this.toasts.shift();
    const ref = document.createElement('div');
    ref.id = 'mozaik-toast';
    ref.style.cssText = `
    position:fixed;
    bottom:calc(10% - 15px);
    left:50%;
    z-index:6;
    transform:translateX(-50%);
    max-width: 300px;
    min-width: 220px;
    box-shadow:1px 1px 4px 0px #00000057;
    padding:12px;
    color:white;
    text-align:center;
    transition:opacity 0.2s ease-out, bottom 0.2s ease-out;
    opacity:0;
    cursor: pointer;
    `;
    ref.textContent = this.currentToast.message;
    switch (this.currentToast.level) {
      case ToastLevel.danger:
        ref.style.backgroundColor = '#ba0d0d';
        break;
      case ToastLevel.success:
        ref.style.backgroundColor = '#0d900d';
        break;
      case ToastLevel.warning:
        ref.style.backgroundColor = '#dd8d16';
        break;
      default:
        ref.style.backgroundColor = '#fafafa';
        ref.style.color = 'black';
    }
    this.doc.body.appendChild(ref);
    await promiseTimeout();
    ref.style.opacity = '1';
    ref.style.bottom = '10%';
    this.toastTimeout = setTimeout(() => this.changeToast(), 6000);
    ref.addEventListener('click', () => {
      clearTimeout(this.toastTimeout);
      this.changeToast();
    });
  }

  private async hide() {
    const ref = document.getElementById('mozaik-toast');
    ref.style.transition = 'opacity 0.2s ease-in, bottom 0.2s ease-in';
    ref.style.opacity = '0';
    ref.style.bottom = 'calc(10% - 15px)';
    await promiseTimeout(200);
    this.doc.body.removeChild(ref);
  }

  private async changeToast() {
    this.currentToast = null;
    await this.hide();
    if (this.toasts.length) {
      this.show();
    }
  }
}
