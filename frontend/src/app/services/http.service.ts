import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { retry, concatMap, delay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public apiUrl = 'http://localhost:5000/api/';

  private retryPipeline = retry({
    count: 5,
    delay: (err) =>
      err.pipe(
        concatMap((e: HttpErrorResponse, i) => {
          if (![503, 504, 0, 429, 425].includes(e.status)) {
            return throwError(() => e);
          }
          return of(e).pipe(delay(i * 500));
        })
      ),
  });

  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(this.apiUrl + url, {
        params: params,
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        }),
        this.retryPipeline as any
      );
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http
      .post<T>(this.apiUrl + url, body)
      .pipe(this.retryPipeline as any);
  }

  put(url: string, body: any): Observable<void> {
    return this.http
      .put<void>(this.apiUrl + url, body)
      .pipe(this.retryPipeline as any);
  }

  delete(url: string, params?: HttpParams): Observable<void> {
    return this.http
      .delete<void>(this.apiUrl + url, {
        params: params,
      })
      .pipe(this.retryPipeline as any);
  }
}
