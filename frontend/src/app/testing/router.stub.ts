import { Injectable } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable()
export class RouterStub {
  public events = new Subject<RouterEvent>();
  public navigate = jasmine.createSpy('router.navigate');
}
