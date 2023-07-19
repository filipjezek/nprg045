import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  auditTime,
  concat,
  defer,
  last,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Ads, AdsProgress } from '../store/reducers/ads.reducer';
import { HttpService } from './http.service';
import { Action, Store } from '@ngrx/store';
import { State } from '../store/reducers';
import { parseCSV } from '../utils/parse-csv';
import { createArray } from '../utils/create-array';
import {
  adsLoadingProgress,
  initAdsLoadingProgress,
} from '../store/actions/ads.actions';

@Injectable({
  providedIn: 'root',
})
export class AdsService {
  private readonly progressThrottle = 200;
  constructor(private http: HttpService, private store: Store<State>) {}

  public loadAds(path: string): Observable<Omit<Ads, 'index'>[]> {
    return this.http.get<Omit<Ads, 'index'>[]>(
      'analysis_ds/all',
      new HttpParams().append('path', path)
    );
  }

  public loadSpecificAds(
    path: string,
    ads: Ads
  ): Observable<Omit<Ads, 'index'>> {
    let params = new HttpParams().append('path', path);
    Object.entries({
      tags: ads.tags,
      stimulus: JSON.stringify(ads.stimulus),
      algorithm: ads.algorithm,
      valueName: ads.valueName,
      identifier: ads.identifier,
      neuron: ads.neuron,
      sheet: ads.sheet,
    }).forEach(([key, val]) => {
      if (val !== null) params = params.appendAll({ [key]: val });
    });

    return this.http.get<Omit<Ads, 'index'>>('analysis_ds', params).pipe(
      switchMap((ds) => {
        const parts: Record<string, number> = {};
        const queue: Observable<any>[] = [];
        this.findLinks(ds, (parent, prop, path) => {
          const linkEl: { '@link': string; dimensions: number[] } =
            parent[prop];
          parts[path] = linkEl.dimensions.reduce((a, b) => a * b, 1);
          queue.push(
            defer(() =>
              this.getFurtherData(
                linkEl['@link'],
                linkEl.dimensions,
                ads.index,
                path
              ).pipe(tap((array) => (parent[prop] = array)))
            )
          );
        });

        if (queue.length > 0) {
          this.store.dispatch(
            initAdsLoadingProgress({ index: ads.index, parts })
          );
          return concat(...queue).pipe(
            last(),
            map(() => ds)
          );
        } else {
          return of(ds);
        }
      })
    );
  }

  /**
   * @param path argument for recursion
   */
  private findLinks(
    ds: any,
    cb: (parent: any, prop: string | number, fullPath: string) => void,
    path?: string
  ) {
    for (const prop in ds) {
      if (Object.prototype.hasOwnProperty.call(ds, prop)) {
        const el = ds[prop];
        const fullPath = path ? `${path}.${prop}` : prop;
        if (el instanceof Array && el[0] && typeof el[0] == 'object') {
          el.forEach((inner, i) => {
            if ('@link' in inner) {
              cb(el, i, fullPath + `[${i}]`);
            } else {
              this.findLinks(inner, cb, fullPath);
            }
          });
        } else if (el && typeof el == 'object') {
          if ('@link' in el) {
            cb(ds, prop, fullPath);
          } else {
            this.findLinks(el, cb, fullPath);
          }
        }
      }
    }
  }

  /**
   * If the ads is too large to load at once, it can be streamed.
   * The service will follow `@link` objects and load CSV found there,
   * transforming it into arrays of given dimensions. These dimensions
   * may or may not correspond to the csv structure.
   *
   * @example ```
   *  ({
   *     foo: 1,
   *     bar: 2,
   *     baz: {'@link': '/my/path', 'dimensions': [2,3]}
   *  })
   *
   *  // results in something like this:
   *
   *  ({foo: 1, bar: 2, baz: [[1,2],[3,4],[5,6]]})
   *
   * ```
   *
   * @param link path to the csv
   * @param dimensions dimensions of the result array
   * @param index index of the ads
   * @param path path to the loaded property (for reporting)
   */
  private getFurtherData(
    link: string,
    dimensions: number[],
    index: number,
    path: string
  ): Observable<any[]> {
    const result = createArray(dimensions);
    const reporter = new Subject<Action>();
    let progress = 0;
    const position = dimensions.map(() => 0);
    const sub = reporter
      .pipe(auditTime(this.progressThrottle))
      .subscribe((a) => this.store.dispatch(a));

    return this.http
      .consumeStream(link, {
        method: 'GET',
      })
      .pipe(
        parseCSV(),
        map((record) => {
          this.fillMDArray(result, dimensions, record, position);
          progress += record.length;
          reporter.next(adsLoadingProgress({ path, index, current: progress }));
          return result;
        }),
        last(),
        tap(() => {
          this.store.dispatch(
            adsLoadingProgress({ path, index, current: progress })
          );
          sub.unsubscribe();
          reporter.complete();
        })
      );
  }

  private fillMDArray(
    array: any[],
    dimensions: number[],
    values: number[],
    position: number[]
  ) {
    const d = dimensions.length;
    const getInner = (arr: any[], depth = 0): number[] => {
      if (depth == d - 1) return arr;
      return getInner(arr[position[depth]], depth + 1);
    };
    let inner = getInner(array);

    for (let i = 0; i < values.length; ++i) {
      inner[position[d - 1]] = values[i];
      position[d - 1]++;
      if (position[d - 1] == dimensions[d - 1]) {
        for (let p = d - 1; p >= 0 && position[p] == dimensions[p]; --p) {
          position[p] = 0;
          if (p > 0) position[p - 1]++;
        }
        inner = getInner(array);
      }
    }
  }
}
