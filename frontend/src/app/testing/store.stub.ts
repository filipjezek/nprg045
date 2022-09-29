import { BehaviorSubject, map, Subject } from 'rxjs';

export class StoreStub<State = any> {
  subject = new BehaviorSubject<RecursivePartial<State>>({});
  select = jasmine
    .createSpy('select')
    .and.callFake((cb) => this.subject.pipe(map(cb)));
  dispatch = jasmine.createSpy('dispatch');
}
