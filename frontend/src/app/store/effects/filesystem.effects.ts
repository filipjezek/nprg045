import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { ToastService } from 'src/app/widgets/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  loadingOverlayDecrement,
  loadingOverlayIncrement,
} from '../actions/ui.actions';
import { Toast } from 'src/app/widgets/services/toast';
import { FilesystemService } from 'src/app/services/filesystem.service';
import {
  apiError,
  filesystemLoaded,
  loadFilesystem,
} from '../actions/filesystem.actions';

@Injectable()
export class FilesystemEffects {
  loadModel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFilesystem),
      switchMap(() =>
        this.fsService.loadFilesystem().pipe(
          map((fs) => filesystemLoaded({ fs })),
          catchError((err: HttpErrorResponse) => {
            this.toastS.add(new Toast('Failed to load filesystem'));
            return of(apiError({ error: err }));
          })
        )
      )
    )
  );

  loadingOverlayInc$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFilesystem),
      map(() => loadingOverlayIncrement())
    )
  );
  loadingOverlayDec$ = createEffect(() =>
    this.actions$.pipe(
      ofType(filesystemLoaded, apiError),
      map(() => loadingOverlayDecrement())
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private toastS: ToastService,
    private fsService: FilesystemService
  ) {}
}
