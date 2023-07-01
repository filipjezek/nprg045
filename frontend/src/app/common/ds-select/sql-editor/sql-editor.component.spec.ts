import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlEditorComponent } from './sql-editor.component';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { Component } from '@angular/core';
import { FORMAT_SQL } from '../sql/format-sql';
import { SqlHelpComponent } from './sql-help/sql-help.component';

@Component({ selector: 'mozaik-button' })
class ButtonStub {}

describe('SqlEditorComponent', () => {
  let component: SqlEditorComponent;
  let fixture: ComponentFixture<SqlEditorComponent>;
  let dialogS: jasmine.SpyObj<DialogService>;
  const end = new Subject<void>();
  let formatter: jasmine.Spy;
  let el: HTMLElement;
  let buttons: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SqlEditorComponent, ButtonStub],
      providers: [
        {
          provide: DialogService,
          useValue: jasmine.createSpyObj('dialogS', {
            open: { addEventListener: () => {} },
          }),
        },
        { provide: FORMAT_SQL, useValue: jasmine.createSpy('formatSQL') },
      ],
    }).compileComponents();

    dialogS = TestBed.inject(DialogService) as any;
    formatter = TestBed.inject(FORMAT_SQL) as any;
    fixture = TestBed.createComponent(SqlEditorComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    component.content = 'SELECT * FROM data WHERE 1 < 2';
    fixture.detectChanges();
    buttons = Array.from(el.querySelectorAll('mozaik-button'));
  });

  afterEach(() => {
    end.next();
  });
  afterAll(() => {
    end.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display content', () => {
    expect(
      el.querySelector('.editor-container [contenteditable]').textContent
    ).toBe('SELECT * FROM data WHERE 1 < 2');
  });

  it('should format syntax', () => {
    formatter.and.returnValue('foo bar');
    buttons[1].click();
    fixture.detectChanges();
    expect(
      el.querySelector('.editor-container [contenteditable]').textContent
    ).toBe('foo bar');
  });

  it('should show help', () => {
    buttons[0].click();
    fixture.detectChanges();
    expect(dialogS.open).toHaveBeenCalledWith(SqlHelpComponent);
  });

  it('should execute', () => {
    let query: string;
    component.query.pipe(takeUntil(end)).subscribe((q) => (query = q));
    buttons[2].click();
    fixture.detectChanges();
    expect(query).toBe('SELECT * FROM data WHERE 1 < 2');
  });
});
