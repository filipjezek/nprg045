import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Model, ModelInfo } from '../store/reducers/model.reducer';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  constructor() {}

  public loadModels(
    take: number,
    skip: number
  ): Observable<{ models: ModelInfo[]; totalResults: number }> {
    return of({ models: [], totalResults: 0 });
  }
  public loadModel(id: number): Observable<{ model: Model }> {
    return of({ model: null });
  }
}
