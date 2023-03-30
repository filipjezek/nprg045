import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelPageComponent } from './model-page.component';
import { WidgetsModule } from '../../widgets/widgets.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NetworkGraphComponent } from './network-graph/network-graph.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import {
  SelectedDataComponent,
  SumSheetsPipe,
} from './selected-data/selected-data.component';
import { ScaleComponent } from './scale/scale.component';

@NgModule({
  declarations: [
    ModelPageComponent,
    NetworkGraphComponent,
    TooltipComponent,
    SelectedDataComponent,
    ScaleComponent,
    SumSheetsPipe,
  ],
  imports: [CommonModule, WidgetsModule, ReactiveFormsModule],
  providers: [],
})
export class ModelPageModule {}