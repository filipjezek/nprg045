import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { reducers, metaReducers, State } from './store/reducers';
import { LoadingOverlayComponent } from './common/loading-overlay/loading-overlay.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { modelLoaded } from './store/actions/model.actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilesystemEffects } from './store/effects/filesystem.effects';
import { FilesystemComponent } from './common/filesystem/filesystem.component';
import { FeaturesComponent } from './common/features/features.component';
import { OverlayComponent } from './common/overlay/overlay.component';
import { FolderComponent } from './common/filesystem/folder/folder.component';
import { DatastoreComponent } from './common/filesystem/datastore/datastore.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoadingOverlayComponent,
    FilesystemComponent,
    FeaturesComponent,
    OverlayComponent,
    FolderComponent,
    DatastoreComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictActionWithinNgZone: true,
        strictActionTypeUniqueness: true,
      },
    }),
    EffectsModule.forRoot([FilesystemEffects]),
    // for performance reasons many safe checks are disabled (store model is huge and freezing it
    // takes a long time), also some objects will not be displayed in devtools
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      stateSanitizer: (s: State & any) => ({
        ...s,
        model: s.model && {
          ...s.model,
          currentModel: s.model?.currentModel && {},
        },
      }),
      actionSanitizer: (a) =>
        a.type === modelLoaded.type ? { ...a, model: {} } : a,
      logOnly: environment.production,
    }),
    HttpClientModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
