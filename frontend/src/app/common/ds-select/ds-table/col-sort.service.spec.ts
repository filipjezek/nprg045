import { TestBed } from '@angular/core/testing';

import { ColSortService } from './col-sort.service';

describe('ColSortService', () => {
  let service: ColSortService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColSortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
