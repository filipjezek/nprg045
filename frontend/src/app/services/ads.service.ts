import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ads, AdsIdentifier } from '../store/reducers/ads.reducer';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class AdsService {
  constructor(private http: HttpService) {}

  public loadAds(path: string): Observable<Omit<Ads, 'index'>[]> {
    return this.http.get<Omit<Ads, 'index'>[]>(
      'analysis_ds_list',
      new HttpParams().append('path', path)
    );
  }

  public loadSpecificAds(
    path: string,
    identifier: AdsIdentifier,
    alg: string,
    tags: string[]
  ): Observable<Omit<Ads, 'index'>> {
    let params = new HttpParams()
      .append('path', path)
      .append('identifier', identifier)
      .append('algorithm', alg)
      .appendAll({ tags });
    return this.http.get<Omit<Ads, 'index'>>('analysis_ds', params);
  }
}
