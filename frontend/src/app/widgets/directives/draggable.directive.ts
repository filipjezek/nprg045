import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  Output,
} from '@angular/core';
import {
  Observable,
  animationFrameScheduler,
  fromEvent,
  interval,
  map,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { UnsubscribingComponent } from 'src/app/mixins/unsubscribing.mixin';
import { GlobalEventService } from 'src/app/services/global-event.service';

type StyleProps<
  T = Omit<CSSStyleDeclaration, 'length' | 'parentRule' | number>
> = {
  [K in keyof T]: T[K] extends string ? K : never;
};

@Directive({
  selector: '[mozaikDraggable]',
})
export class DraggableDirective
  extends UnsubscribingComponent
  implements AfterViewInit
{
  @HostBinding('class.lifted') lifted = false;
  private placeholder: HTMLDivElement;
  private parentStyle: Partial<CSSStyleDeclaration>;
  private initialStyle: Partial<CSSStyleDeclaration>;
  /**
   * initial cursor position absolute
   */
  private startX: number;
  /**
   * initial offset from the parent
   */
  private startOffsetX: number;

  private animationDuration = 100;

  @Output() swapLeft = new EventEmitter<void>();
  @Output() swapRight = new EventEmitter<void>();
  @Output('drop') dropped = new EventEmitter<void>();
  @Output('lift') liftedEvent = new EventEmitter<void>();

  constructor(
    public elRef: ElementRef<HTMLElement>,
    private gEventS: GlobalEventService,
    public changeDetector: ChangeDetectorRef
  ) {
    super();
  }

  ngAfterViewInit(): void {
    fromEvent<MouseEvent>(this.elRef.nativeElement, 'mousedown')
      .pipe(
        tap((e) => {
          e.preventDefault();
          this.lift();
          const el = this.elRef.nativeElement;
          this.startX = e.clientX;
          this.startOffsetX = el.offsetLeft - el.parentElement.scrollLeft;
        }),
        switchMap(() =>
          this.gEventS.mouseMove.pipe(
            switchMap((e) => this.scrollIfNeccessary(e)),
            takeUntil(
              this.gEventS.mouseReleased.pipe(
                tap(() => {
                  this.drop();
                })
              )
            )
          )
        )
      )
      .subscribe((e) => {
        this.drag(e);
      });
  }

  private lift() {
    this.lifted = true;
    const el = this.elRef.nativeElement;
    const par = el.parentElement;

    this.placeholder = this.createPlaceholder();

    this.parentStyle = this.extractStyle(par, 'position');
    if (getComputedStyle(par).position == 'static') {
      par.style.position = 'relative';
    }
    this.initialStyle = this.extractStyle(
      el,
      'position',
      'margin',
      'marginLeft',
      'marginTop',
      'zIndex'
    );
    this.applyStyle(el, {
      left: el.offsetLeft + 'px',
      top: el.offsetTop + 'px',
      margin: '',
      marginLeft: '0px',
      marginTop: '0px',
      position: 'absolute',
      zIndex: '10',
    });

    el.before(this.placeholder);
    this.liftedEvent.next();
    this.changeDetector.markForCheck();
  }

  private async drop() {
    this.lifted = false;
    this.changeDetector.markForCheck();
    const el = this.elRef.nativeElement;
    this.placeholder.remove();
    this.applyStyle(el, this.initialStyle);
    this.applyStyle(el.parentElement, this.parentStyle);
    this.dropped.emit();
  }

  private async drag(e: MouseEvent) {
    const el = this.elRef.nativeElement;
    const par = el.parentElement;
    let offsetLeft = e.clientX - this.startX + this.startOffsetX;
    offsetLeft = Math.max(0, offsetLeft);
    offsetLeft = Math.min(offsetLeft, par.clientWidth - el.clientWidth);
    this.applyStyle(el, {
      left: offsetLeft + par.scrollLeft + 'px',
    });

    if (
      offsetLeft <= this.startOffsetX &&
      this.placeholder.previousElementSibling
    ) {
      const prev = this.placeholder.previousElementSibling as HTMLElement;
      if (
        offsetLeft + par.scrollLeft <
        prev.offsetLeft + prev.clientWidth / 2
      ) {
        this.placeholder.remove();
        prev.before(this.placeholder);
        el.remove();
        prev.before(el);
        this.startOffsetX = offsetLeft;
        this.startX = e.clientX;
        this.swapLeft.emit();
        await this.animateTab(prev, true);
      }
    }
    if (offsetLeft >= this.startOffsetX && el.nextElementSibling) {
      const next = el.nextElementSibling as HTMLElement;
      if (
        offsetLeft + par.scrollLeft + el.clientWidth >
        next.offsetLeft + next.clientWidth / 2
      ) {
        this.placeholder.remove();
        el.remove();
        next.after(this.placeholder);
        this.placeholder.after(el);
        this.startOffsetX = offsetLeft;
        this.startX = e.clientX;
        this.swapRight.emit();
        await this.animateTab(next, false);
      }
    }
  }

  private createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.style.width = this.elRef.nativeElement.clientWidth + 'px';
    placeholder.style.height = this.elRef.nativeElement.clientHeight + 'px';
    placeholder.style.flexShrink = '0';
    return placeholder;
  }

  private extractStyle(el: HTMLElement, ...props: (keyof StyleProps)[]) {
    const style: Partial<StyleProps> = {};
    props.forEach((p) => ((style as any)[p] = el.style[p]));
    return style;
  }
  private applyStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
    for (const key in style) {
      if (Object.prototype.hasOwnProperty.call(style, key)) {
        el.style[key] = style[key];
      }
    }
  }

  private animateTab(tab: HTMLElement, left: boolean) {
    const path = left
      ? `path("M ${-this.placeholder.clientWidth / 2},${
          tab.clientHeight / 2
        } l${this.placeholder.clientWidth},0")`
      : `path("M ${this.placeholder.clientWidth + tab.clientWidth / 2},${
          tab.clientHeight / 2
        } l${-this.placeholder.clientWidth},0")`;
    const rot = left ? 'auto' : 'reverse';

    const animation = tab.animate(
      [
        {
          offsetDistance: '0%',
          offsetPath: path,
          offsetRotate: rot,
        },
        {
          offsetDistance: '100%',
          offsetPath: path,
          offsetRotate: rot,
        },
      ],
      { duration: this.animationDuration, easing: 'ease-out' }
    );
    return animation.finished;
  }

  private scrollIfNeccessary(e: MouseEvent): Observable<MouseEvent> {
    const el = this.elRef.nativeElement;
    const par = el.parentElement;
    const offsetLeft = e.clientX - this.startX + this.startOffsetX;
    if (offsetLeft <= 0 && par.scrollLeft > 0) {
      return interval(0, animationFrameScheduler).pipe(
        map(() => {
          const scrollDelta = 8;
          par.scrollLeft -= scrollDelta;
          return e;
        }),
        takeWhile(() => par.scrollLeft >= 0)
      );
    } else if (
      offsetLeft >= par.clientWidth - el.clientWidth &&
      par.scrollLeft < par.scrollWidth - par.clientWidth
    ) {
      return interval(0, animationFrameScheduler).pipe(
        map(() => {
          const scrollDelta = 8;
          par.scrollLeft += scrollDelta;
          return e;
        }),
        takeWhile(() => par.scrollLeft < par.scrollWidth - par.clientWidth)
      );
    }
    return of(e);
  }
}
