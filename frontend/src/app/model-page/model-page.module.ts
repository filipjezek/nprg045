import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelPageRoutingModule } from './model-page-routing.module';
import { ModelPageComponent } from './model-page.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModelEffects } from '../store/effects/model.effects';
import * as fromModel from '../store/reducers/model.reducer';
import { NetworkGraphComponent } from './network-graph/network-graph.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { SelectedDataComponent } from './selected-data/selected-data.component';

@NgModule({
  declarations: [
    ModelPageComponent,
    NetworkGraphComponent,
    TooltipComponent,
    SelectedDataComponent,
  ],
  imports: [
    CommonModule,
    ModelPageRoutingModule,
    WidgetsModule,
    ReactiveFormsModule,
    StoreModule.forFeature(fromModel.modelFeatureKey, fromModel.reducer),
    EffectsModule.forFeature([ModelEffects]),
  ],
  providers: [],
})
export class ModelPageModule {}
