import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsInfoComponent } from './ds-info/ds-info.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from './tooltip/tooltip.component';
import { ScaleComponent } from './scale/scale.component';
import { HistogramComponent } from './histogram/histogram.component';
import { NetworkGraphComponent } from './network-graph/network-graph.component';

@NgModule({
  declarations: [
    DsInfoComponent,
    TooltipComponent,
    ScaleComponent,
    HistogramComponent,
    NetworkGraphComponent,
  ],
  imports: [CommonModule, WidgetsModule, FontAwesomeModule],
  exports: [
    DsInfoComponent,
    TooltipComponent,
    ScaleComponent,
    HistogramComponent,
    NetworkGraphComponent,
  ],
})
export class DsPagesCommonModule {}
