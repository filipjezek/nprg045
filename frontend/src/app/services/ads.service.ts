import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ads } from '../store/reducers/ads.reducer';
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
    ads: Ads
  ): Observable<Omit<Ads, 'index'>> {
    let params = new HttpParams().append('path', path).appendAll({
      tags: ads.tags,
      stimulus: JSON.stringify(ads.stimulus),
      algorithm: ads.algorithm,
      valueName: ads.valueName,
      identifier: ads.identifier,
      neuron: ads.neuron,
      sheet: ads.sheet,
    });
    return this.http.get<Omit<Ads, 'index'>>('analysis_ds', params);
  }
}
