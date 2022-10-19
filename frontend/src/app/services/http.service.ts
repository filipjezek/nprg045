import { Inject, Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { retry, delay } from 'rxjs/operators';
import { DOCUMENT, Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public apiUrl = '/api/';

  private retryPipeline = retry({
    count: 5,
    delay: (e, i) => {
      if (![503, 504, 0, 429, 425].includes(e.status)) {
        return throwError(() => e);
      }
      return of(e).pipe(delay(i * 500));
    },
  });

  constructor(private http: HttpClient, @Inject(DOCUMENT) doc: Document) {
    this.apiUrl =
      (environment.production ? doc.location.origin : 'http://localhost:5000') +
      this.apiUrl;
  }

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(this.apiUrl + url, {
        params: params,
      })
      .pipe(this.retryPipeline as any);
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
