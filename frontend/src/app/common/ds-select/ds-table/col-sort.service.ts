import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SortColumn {
  key: string;
  asc: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ColSortService {
  private templateSubj = new BehaviorSubject<SortColumn>(null);
  private codeSubj = new BehaviorSubject<SortColumn>(null);
  public sortChangedFromTemplate$ = this.templateSubj.asObservable();
  public sortChangedFromCode$ = this.codeSubj.asObservable();

  constructor() {}

  public setSortColumn(params: SortColumn, fromTemplate: boolean) {
    (fromTemplate ? this.templateSubj : this.codeSubj).next(params);
  }
}
