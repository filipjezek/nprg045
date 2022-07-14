import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map } from 'rxjs/operators';
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
      switchMap(({ path }) =>
        this.modelS.loadModel(path).pipe(
          map(({ model }) => modelLoaded({ model })),
          catchError((err: HttpErrorResponse) => {
            this.toastS.add(new Toast('Failed to load data'));
            return of(apiError({ error: err }));
          })
        )
      )
    )
  );

  loadingOverlayInc$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadModel),
      map(() => loadingOverlayIncrement())
    )
  );
  loadingOverlayDec$ = createEffect(() =>
    this.actions$.pipe(
      ofType(modelLoaded, apiError),
      map(() => loadingOverlayDecrement())
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
