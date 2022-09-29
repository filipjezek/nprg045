import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';

@Injectable()
export class GlobalEventServiceStub {
  constructor() {}

  public subj = new Subject<{
    type: string;
    event: any;
  }>();

  documentClicked = this.subj.pipe(
    filter(({ type }) => type.startsWith('click:')),
    pluck('event')
  );
  overlayClicked = this.subj.pipe(
    filter(({ type }) => type === 'click:overlay'),
    pluck('event')
  );
  keyPressed = this.subj.pipe(
    filter(({ type }) => type.startsWith('key:')),
    pluck('event')
  );
  enterPressed = this.subj.pipe(
    filter(({ type }) => type === 'key:enter'),
    pluck('event')
  );
  escapePressed = this.subj.pipe(
    filter(({ type }) => type === 'key:escape'),
    pluck('event')
  );
  spacePressed = this.subj.pipe(
    filter(({ type }) => type === 'key:space'),
    pluck('event')
  );
  mouseReleased = this.subj.pipe(
    filter(({ type }) => type === 'mouseup'),
    pluck('event')
  );
}
