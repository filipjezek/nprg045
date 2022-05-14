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

@NgModule({
  declarations: [AppComponent, HeaderComponent, LoadingOverlayComponent],
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
    EffectsModule.forRoot([]),
    // for performance reasons many safe checks are disabled (store model is huge and freezing it
    // takes a long time), also some objects will not be displayed in devtools
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      stateSanitizer: (s: State & any) => ({
        ...s,
        model: { ...s.model, currentModel: {} },
      }),
      actionSanitizer: (a) =>
        a.type === modelLoaded.type ? { ...a, model: {} } : a,
      logOnly: environment.production,
    }),
    HttpClientModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
