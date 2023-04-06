import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map, tap, mergeMap } from 'rxjs/operators';
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
  loadDirectory,
  loadRecursiveFilesystem,
} from '../actions/filesystem.actions';

@Injectable()
export class FilesystemEffects {
  loadRecursiveFilesystem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRecursiveFilesystem),
      tap(() => this.store.dispatch(loadingOverlayIncrement())),
      mergeMap(({ path }) =>
        this.fsService.loadRecursiveFilesystem(path).pipe(
          map((fs) => filesystemLoaded({ fs, path })),
          catchError((err: HttpErrorResponse) => {
            this.toastS.add(new Toast('Failed to load filesystem'));
            return of(apiError({ error: err }));
          })
        )
      ),
      tap(() => this.store.dispatch(loadingOverlayDecrement()))
    )
  );

  loadDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadDirectory),
      mergeMap(({ path }) =>
        this.fsService.loadDirectory(path).pipe(
          map((fs) => filesystemLoaded({ fs, path })),
          catchError((err: HttpErrorResponse) => {
            this.toastS.add(new Toast('Failed to load directory'));
            return of(apiError({ error: err }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private toastS: ToastService,
    private fsService: FilesystemService
  ) {}
}
