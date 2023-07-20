import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterStringComponent } from './filter-string.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';

describe('FilterStringComponent', () => {
  let component: FilterStringComponent;
  let fixture: ComponentFixture<FilterStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterStringComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
