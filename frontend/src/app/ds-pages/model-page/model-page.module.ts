import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelPageComponent } from './model-page.component';
import { WidgetsModule } from '../../widgets/widgets.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PNVNetworkGraphComponent } from './network-graph/network-graph.component';
import { DsPagesCommonModule } from '../common/ds-pages-common.module';

@NgModule({
  declarations: [ModelPageComponent, PNVNetworkGraphComponent],
  imports: [
    CommonModule,
    WidgetsModule,
    ReactiveFormsModule,
    DsPagesCommonModule,
  ],
  providers: [],
})
export class ModelPageModule {}
