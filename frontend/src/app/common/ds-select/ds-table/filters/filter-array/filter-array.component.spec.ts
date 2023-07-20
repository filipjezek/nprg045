import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterArrayComponent } from './filter-array.component';
import { Store } from '@ngrx/store';
import { StoreStub } from 'src/app/testing/store.stub';

describe('FilterArrayComponent', () => {
  let component: FilterArrayComponent;
  let fixture: ComponentFixture<FilterArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterArrayComponent],
      providers: [{ provide: Store, useClass: StoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
