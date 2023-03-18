import { HttpClientModule } from '@angular/common/http';
import { ElementRef, Injector, NgModule } from '@angular/core';
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
import { hoverNode, modelLoaded } from './store/actions/model.actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilesystemEffects } from './store/effects/filesystem.effects';
import { FilesystemComponent } from './common/filesystem/filesystem.component';
import { OverlayComponent } from './common/overlay/overlay.component';
import { FolderComponent } from './common/filesystem/folder/folder.component';
import { DatastoreComponent } from './common/filesystem/datastore/datastore.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { WidgetsModule } from './widgets/widgets.module';
import { AdsEffects } from './store/effects/ads.effects';
import { RouteReuseStrategy } from '@angular/router';
import { MozaikRouteReuseStrategy } from './route-reuse-strategy';
import { Dialog } from './dialog';
import { createCustomElement } from '@angular/elements';
import { NetworkTrackerComponent } from './common/network-tracker/network-tracker.component';
import { DsSelectComponent } from './common/ds-select/ds-select.component';
import { DsTableComponent } from './common/ds-select/ds-table/ds-table.component';
import { CellEmptyComponent } from './common/ds-select/ds-table/cell-empty/cell-empty.component';
import { CellGenericComponent } from './common/ds-select/ds-table/cell-generic/cell-generic.component';
import { CellObjectComponent } from './common/ds-select/ds-table/cell-object/cell-object.component';
import { CellLinkComponent } from './common/ds-select/ds-table/cell-link/cell-link.component';
import { CellKeyvalueComponent } from './common/ds-select/ds-table/cell-keyvalue/cell-keyvalue.component';
import { CellListComponent } from './common/ds-select/ds-table/cell-list/cell-list.component';

const customEls: ((new (el: ElementRef, ...args: any[]) => Dialog) & {
  selector: string;
})[] = [NetworkTrackerComponent];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoadingOverlayComponent,
    FilesystemComponent,
    OverlayComponent,
    FolderComponent,
    DatastoreComponent,
    NotFoundComponent,
    NetworkTrackerComponent,
    DsSelectComponent,
    DsTableComponent,
    CellEmptyComponent,
    CellGenericComponent,
    CellObjectComponent,
    CellLinkComponent,
    CellKeyvalueComponent,
    CellListComponent,
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
    EffectsModule.forRoot([FilesystemEffects, AdsEffects]),
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
      actionsBlocklist: [hoverNode.type],
      logOnly: environment.production,
    }),
    HttpClientModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    StoreRouterConnectingModule.forRoot(),
    WidgetsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: MozaikRouteReuseStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    customEls.forEach((el) => {
      const custEl = createCustomElement<Dialog>(el, { injector });
      customElements.define(el.selector, custEl);
    });
  }
}
