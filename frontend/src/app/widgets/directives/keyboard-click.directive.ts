import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[mozaikKeyboardClick]',
})
export class KeyboardClickDirective {
  @Input() listenToSpace = true;
  @Input() listenToEnter = true;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
    if (
      (this.listenToSpace &&
        (e.which === 32 || e.key === ' ' || e.key === 'Spacebar')) ||
      (this.listenToEnter && (e.which === 13 || e.key === 'Enter'))
    ) {
      this.el.nativeElement.click();
    }
  }
}
