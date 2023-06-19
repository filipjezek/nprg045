import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { ToastService } from './toast.service';
import { DOCUMENT } from '@angular/common';
import { ToastLevel } from './toast';

describe('ToastService', () => {
  let service: ToastService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    doc = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show toast', fakeAsync(() => {
    service.add({ level: ToastLevel.normal, message: 'hello world' });
    const toast = doc.querySelector('#mozaik-toast');
    expect(toast.textContent).toBe('hello world');
    flush();
  }));

  it('should hide toast', fakeAsync(() => {
    service.add({ level: ToastLevel.normal, message: 'hello world' });
    flush();
    const toast = doc.querySelector('#mozaik-toast');
    expect(toast).toBe(null);
  }));

  it('should hide toast on click', fakeAsync(() => {
    service.add({ level: ToastLevel.normal, message: 'hello world' });
    let toast = doc.querySelector<HTMLElement>('#mozaik-toast');
    tick(0);
    toast.click();
    tick(200); // animation
    toast = doc.querySelector<HTMLElement>('#mozaik-toast');
    expect(toast).toBe(null);
  }));

  it('should queue toasts', fakeAsync(() => {
    service.add({ level: ToastLevel.normal, message: 'hello world' });
    service.add({ level: ToastLevel.normal, message: 'hello world 2' });
    tick(6200);
    let toast = doc.querySelector<HTMLElement>('#mozaik-toast');
    expect(toast.textContent).toBe('hello world 2');
    flush();
  }));
});
