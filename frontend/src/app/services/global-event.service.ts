import { Injectable, Inject } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GlobalEventService {
  public documentClicked: Observable<MouseEvent>;
  public keyPressed: Observable<KeyboardEvent>;
  public enterPressed: Observable<KeyboardEvent>;
  public spacePressed: Observable<KeyboardEvent>;
  public escapePressed: Observable<KeyboardEvent>;
  public mouseReleased: Observable<MouseEvent>;
  public mouseMove: Observable<MouseEvent>;
  public overlayClicked: Observable<MouseEvent>;

  constructor(@Inject(DOCUMENT) private doc: Document) {
    this.documentClicked = fromEvent<MouseEvent>(this.doc, 'click').pipe(
      share()
    );
    this.overlayClicked = this.documentClicked.pipe(
      filter(
        (e) => (e.target as HTMLElement).closest('mozaik-overlay') !== null
      ),
      share()
    );

    this.keyPressed = fromEvent<KeyboardEvent>(this.doc, 'keydown').pipe(
      share()
    );
    this.enterPressed = this.keyPressed.pipe(
      filter((e) => e.which === 13 || e.key === 'Enter'),
      share()
    );
    this.spacePressed = this.keyPressed.pipe(
      filter((e) => e.which === 32 || e.key === ' ' || e.key === 'Spacebar'),
      share()
    );
    this.escapePressed = this.keyPressed.pipe(
      filter((e) => e.which === 27 || e.key === 'Escape'),
      share()
    );
    this.mouseReleased = fromEvent<MouseEvent>(this.doc, 'mouseup').pipe(
      share()
    );
    this.mouseMove = fromEvent<MouseEvent>(this.doc, 'mousemove').pipe(share());
  }
}
