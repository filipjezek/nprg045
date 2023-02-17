import { Inject, Injectable } from '@angular/core';
import {
  Observable,
  throwError,
  of,
  from,
  ReadableStreamLike,
  pipe,
  defer,
} from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import {
  retry,
  delay,
  switchMap,
  finalize,
  first,
  raceWith,
} from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { State } from '../store/reducers';
import {
  requestCancel,
  requestFinished,
  requestRetried,
  requestStarted,
} from '../store/actions/network.actions';
import { Actions, ofType } from '@ngrx/effects';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private static requestCount = 0;
  public apiUrl = '/api/';

  private retryPipeline = (id: number) =>
    pipe(
      raceWith(
        this.actions$.pipe(
          ofType(requestCancel),
          first((a) => a.id == id),
          switchMap(() => throwError(() => new Error('User cancelled')))
        )
      ),
      retry({
        count: 5,
        delay: (e, i) => {
          if (![503, 504, 0, 429, 425].includes(e.status)) {
            return throwError(() => e);
          }
          this.store.dispatch(requestRetried({ id }));
          return of(e).pipe(delay(i * 500));
        },
      }),
      finalize(() => this.store.dispatch(requestFinished({ id })))
    );

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) doc: Document,
    private store: Store<State>,
    private actions$: Actions
  ) {
    this.apiUrl =
      (environment.production ? doc.location.origin : 'http://localhost:5000') +
      this.apiUrl;
  }

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return defer<Observable<T>>(() => {
      const id = HttpService.requestCount++;
      this.store.dispatch(requestStarted({ id, url, method: 'GET' }));

      return this.http
        .get<T>(this.apiUrl + url, {
          params: params,
        })
        .pipe(this.retryPipeline(id) as any);
    });
  }

  post<T>(url: string, body: any): Observable<T> {
    return defer<Observable<T>>(() => {
      const id = HttpService.requestCount++;
      this.store.dispatch(requestStarted({ id, url, method: 'POST' }));

      return this.http
        .post<T>(this.apiUrl + url, body)
        .pipe(this.retryPipeline(id) as any);
    });
  }

  put(url: string, body: any): Observable<void> {
    return defer<Observable<void>>(() => {
      const id = HttpService.requestCount++;
      this.store.dispatch(requestStarted({ id, url, method: 'PUT' }));

      return this.http
        .put<void>(this.apiUrl + url, body)
        .pipe(this.retryPipeline(id) as any);
    });
  }

  delete(url: string, params?: HttpParams): Observable<void> {
    return defer<Observable<void>>(() => {
      const id = HttpService.requestCount++;
      this.store.dispatch(requestStarted({ id, url, method: 'DELETE' }));

      return this.http
        .delete<void>(this.apiUrl + url, {
          params: params,
        })
        .pipe(this.retryPipeline(id) as any);
    });
  }

  consumeStream(
    url: string,
    options: {
      params?: HttpParams;
      body?: any;
      method: string;
    }
  ): Observable<string> {
    return defer<Observable<string>>(() => {
      const id = HttpService.requestCount++;
      this.store.dispatch(requestStarted({ id, url, method: 'GET' }));

      return from(
        fetch(
          this.apiUrl +
            url +
            (options.params ? '?' + options.params.toString() : ''),
          {
            method: options.method,
            body: options.body,
          }
        )
      ).pipe(
        switchMap((resp) =>
          resp.ok
            ? from(
                resp.body.pipeThrough(
                  new TextDecoderStream()
                ) as ReadableStreamLike<string>
              )
            : throwError(
                () =>
                  new HttpErrorResponse({
                    status: resp.status,
                    statusText: resp.statusText,
                    url: resp.url,
                  })
              )
        ),
        this.retryPipeline(id) as any
      );
    });
  }
}
