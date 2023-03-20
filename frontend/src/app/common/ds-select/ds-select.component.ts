import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatestWith,
  map,
  retry,
  skip,
  tap,
} from 'rxjs';
import { State } from 'src/app/store/reducers/';
import { routerSelectors } from 'src/app/store/selectors/router.selectors';
import alasql from 'alasql';
import { makeLink } from './user-sql-functions/make-link';

@Component({
  selector: 'mozaik-ds-select',
  templateUrl: './ds-select.component.html',
  styleUrls: ['./ds-select.component.scss'],
})
export class DsSelectComponent implements OnInit {
  querySubj = new BehaviorSubject<string>(
    'SELECT MAKE_LINK(`index`) link, algorithm, stimulus FROM data'
  );

  ads$ = this.store.select((x) => x.ads.allAds);
  path$ = this.store.select(routerSelectors.selectRouteParam('path'));
  sqlres$ = this.ads$.pipe(
    tap((data) =>
      alasql(
        `
    DROP TABLE IF EXISTS data;
    CREATE TABLE data (
      \`index\` INT PRIMARY KEY,
      algorithm STRING,
      identifier STRING,
      neuron INT,
      period INT,
      sheet STRING,
      stimulus JSON,
      tags JSON,
      unit STRING,
      valueName STRING
    );
    INSERT INTO data SELECT * FROM ?
    `,
        [data]
      )
    ),
    combineLatestWith(this.querySubj),
    map(([data, query]) => alasql(query)),
    retry({
      delay: (error) => {
        this.error = error;
        return this.querySubj.pipe(skip(1));
      },
    }),
    tap(() => (this.error = ''))
  );

  error = '';

  constructor(private store: Store<State>) {
    this.addUserFunctions();
  }

  ngOnInit(): void {}

  private addUserFunctions() {
    alasql.fn['MAKE_LINK'] = makeLink;
  }
}
