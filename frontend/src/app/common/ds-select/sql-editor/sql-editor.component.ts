import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { sql, SQLDialect } from '@codemirror/lang-sql';
import {} from '@codemirror/lang-sql/';
import { Ads } from 'src/app/store/reducers/ads.reducer';
import { alasqlFunctions, alasqlDialect } from '../sql/sql-dialect';
import { formatDialect } from 'sql-formatter';
import { DialogService } from 'src/app/services/dialog.service';
import { SqlHelpComponent } from './sql-help/sql-help.component';

const SQLKeywords =
  'action add after all allocate alter and any are as asc assertion at authorization before begin between both breadth by call cascade cascaded case cast catalog check close collate collation column commit condition connect connection constraint constraints constructor continue corresponding count create cross cube current current_date current_default_transform_group current_transform_group_for_type current_path current_role current_time current_timestamp current_user cursor cycle data day deallocate declare default deferrable deferred delete depth deref desc describe descriptor deterministic diagnostics disconnect distinct do domain drop dynamic each else elseif end end-exec equals escape except exception exec execute exists exit external fetch first for foreign found from free full function general get global go goto grant group grouping handle having hold hour identity if immediate in indicator initially inner inout input insert intersect into is isolation join key language last lateral leading leave left level like limit local localtime localtimestamp locator loop map match method minute modifies module month names natural nesting new next no none not of old on only open option or order ordinality out outer output overlaps pad parameter partial path prepare preserve primary prior privileges procedure public read reads recursive redo ref references referencing relative release repeat resignal restrict result return returns revoke right role rollback rollup routine row rows savepoint schema scroll search second section select session session_user set sets signal similar size some space specific specifictype sql sqlexception sqlstate sqlwarning start state static system_user table temporary then timezone_hour timezone_minute to trailing transaction translation treat trigger under undo union unique unnest until update usage user using value values view when whenever where while with without work write year zone ';

@Component({
  selector: 'mozaik-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SqlEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('editorContainer')
  private editorContainer: ElementRef<HTMLElement>;

  @Output() query = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  private editor: EditorView;
  private initialQuery = '';

  @Input() set content(c: string) {
    if (this.editor) {
      this.editor.dispatch({
        changes: {
          from: 0,
          to: this.editor.state.sliceDoc().length,
          insert: c,
        },
      });
    } else {
      this.initialQuery = c;
    }
  }
  get content() {
    if (this.editor) {
      return this.editor.state.sliceDoc();
    }
    return this.initialQuery;
  }

  constructor(private dialogS: DialogService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const cols: (keyof Ads)[] = [
      'algorithm',
      'identifier',
      'index',
      'neuron',
      'period',
      'sheet',
      'stimulus',
      'tags',
      'unit',
      'valueName',
    ];

    this.editor = new EditorView({
      parent: this.editorContainer.nativeElement,
      doc: this.initialQuery,
      extensions: [
        basicSetup,
        sql({
          upperCaseKeywords: true,
          schema: {
            data: cols,
          },
          defaultTable: 'data',
          dialect: SQLDialect.define({
            identifierQuotes: '`',
            specialVar: '',
            keywords: Array.from(
              new Set([
                ...SQLKeywords.split(' '),
                ...alasqlFunctions.map((fn) => fn.toLowerCase()),
              ])
            ).join(' '),
          }),
        }),
        EditorView.theme({
          '&': {
            height: '120px',
            resize: 'vertical',
            overflow: 'hidden',
            minHeight: '120px',
          },
          '.cm-scroller': { overflow: 'auto' },
        }),
        Prec.highest(
          keymap.of([
            {
              key: 'Ctrl-Enter',
              run: () => {
                this.submit();
                return true;
              },
            },
          ])
        ),
      ],
    });
  }

  submit() {
    this.query.emit(this.content);
  }

  format() {
    try {
      this.content = formatDialect(this.content, {
        dialect: alasqlDialect,
        keywordCase: 'upper',
      });
    } catch (e: any) {
      this.error.emit(e.message);
    }
  }

  showHelp() {
    const elref = this.dialogS.open(SqlHelpComponent);
    elref.addEventListener('close', () => this.dialogS.close());
  }
}
