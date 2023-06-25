import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsSelectComponent } from './ds-select.component';
import { StoreStub } from 'src/app/testing/store.stub';
import { ALASQL } from './sql/alasql';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import {
  Component,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  Output,
} from '@angular/core';
import { SQLBuilder, SQLBuilderFactory } from './sql/sql-builder';
import { By } from '@angular/platform-browser';
import { changeQuery } from 'src/app/store/actions/navigator.actions';
import { diffMeta } from './sql/user-sql-functions/make-diff';

@Component({
  selector: 'mozaik-sql-editor',
})
class SQLEditorStub {
  @Output() query = new EventEmitter<string>();
}
@Component({
  selector: 'mozaik-ds-table',
})
class TableStub {
  @Input() src: Record<string, any>[];
}

describe('DsSelectComponent', () => {
  let component: DsSelectComponent;
  let fixture: ComponentFixture<DsSelectComponent>;
  let sql: jasmine.Spy;
  let store: StoreStub<State>;
  let sqlBuilder: jasmine.SpyObj<SQLBuilder>;

  beforeEach(async () => {
    sqlBuilder = jasmine.createSpyObj(
      'sqlBuilder',
      {
        getColumnNames: [],
      },
      {
        statements: 1,
      }
    );
    await TestBed.configureTestingModule({
      declarations: [DsSelectComponent, SQLEditorStub, TableStub],
      providers: [
        { provide: ALASQL, useValue: jasmine.createSpy('alasql') },
        { provide: Store, useClass: StoreStub },
        { provide: SQLBuilderFactory, useValue: { create: () => sqlBuilder } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    sql = TestBed.inject(ALASQL) as any;
    sql.and.returnValue([]);
    fixture = TestBed.createComponent(DsSelectComponent);
    store = TestBed.inject(Store) as any;

    store.subject.next({ navigator: { query: '' }, ads: { allAds: [] } });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('querying data', () => {
    it('should query data when state changes', () => {
      expect(sql).toHaveBeenCalledWith('');
      store.subject.next({
        ...store.subject.value,
        navigator: { query: 'foo bar' },
      });
      expect(sql).toHaveBeenCalledWith('foo bar');
    });

    it('should query data on editor event', () => {
      fixture.debugElement
        .query(By.directive(SQLEditorStub))
        .componentInstance.query.emit('foo bar baz');
      fixture.detectChanges();
      expect(store.dispatch).toHaveBeenCalledWith(
        changeQuery({ query: 'foo bar baz' })
      );
    });

    it('should appy MAKE_DIFF', () => {
      sql.and.returnValue([
        [{ key1: 1, key2: 1, [diffMeta]: 1 }, { key1: 2 }],
        [{ key1: 2, key2: 1, [diffMeta]: 1 }, { key1: 2 }],
        [{ key1: 3, key2: 1, key3: 54, [diffMeta]: 1 }],
      ]);
      sqlBuilder.getColumnNames.and.returnValue(['foo', 'bar']);
      store.subject.next({
        ...store.subject.value,
        navigator: { query: 'MAKE_DIFF(foo)' },
      });
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.directive(TableStub)).componentInstance
          .src
      ).toEqual([
        [{ key1: 1 }, { key1: 2 }],
        [{ key1: 2 }, { key1: 2 }],
        [{ key1: 3, key3: 54 }],
      ]);
    });
  });

  it('should create data table', () => {
    expect(sql).toHaveBeenCalledWith(
      jasmine.stringMatching(
        /CREATE TABLE data \(.+;.*INSERT INTO data SELECT \* FROM \?/s
      ),
      [store.subject.value.ads.allAds]
    );
  });

  it('should drop data table', () => {
    component.ngOnDestroy();
    expect(sql).toHaveBeenCalledWith(
      jasmine.stringMatching(/DROP TABLE data\b/)
    );
  });
});
