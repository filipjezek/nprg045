import {
  Output,
  EventEmitter,
  HostBinding,
  Input,
  ElementRef,
  Directive,
} from '@angular/core';
import { UnsubscribingComponent } from './mixins/unsubscribing.mixin';

@Directive({})
export abstract class Dialog extends UnsubscribingComponent {
  @Output() close = new EventEmitter();
  @Output() value = new EventEmitter();
  @HostBinding('@appear') @Input() animationProp: any;

  constructor(protected el: ElementRef<HTMLElement>) {
    super();
  }

  public focus(): void {
    this.el.nativeElement.setAttribute('tabindex', '-1');
    this.el.nativeElement.focus();
    this.el.nativeElement.setAttribute('tabindex', null);
  }
}
