import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map, mapTo } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { apiError, loadModel, modelLoaded } from '../actions/model.actions';
import { ToastService } from 'src/app/widgets/services/toast.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  loadingOverlayDecrement,
  loadingOverlayIncrement,
} from '../actions/ui.actions';
import { Toast } from 'src/app/widgets/services/toast';
import { ModelService } from 'src/app/model-page/model.service';

@Injectable()
export class ModelEffects {
  loadModel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadModel),
      switchMap(() => this.modelS.loadModel()),
      map(({ model }) => modelLoaded({ model })),
      catchError((err: HttpErrorResponse) => {
        if (err.status < 500 && err.status >= 400) {
          this.router.navigateByUrl('not-found');
        } else {
          this.toastS.add(new Toast('Failed to load data'));
        }
        return of(apiError({ error: err }));
      })
    )
  );

  loadingOverlayInc$ = createEffect(() =>
    this.actions$.pipe(ofType(loadModel), mapTo(loadingOverlayIncrement()))
  );
  loadingOverlayDec$ = createEffect(() =>
    this.actions$.pipe(
      ofType(modelLoaded, apiError),
      mapTo(loadingOverlayDecrement())
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private toastS: ToastService,
    private modelS: ModelService,
    private router: Router
  ) {}
}
