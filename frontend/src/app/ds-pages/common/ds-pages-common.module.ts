import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsInfoComponent } from './ds-info/ds-info.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from './tooltip/tooltip.component';
import { ScaleComponent } from './scale/scale.component';
import { HistogramComponent } from './histogram/histogram.component';

@NgModule({
  declarations: [
    DsInfoComponent,
    TooltipComponent,
    ScaleComponent,
    HistogramComponent,
  ],
  imports: [CommonModule, WidgetsModule, FontAwesomeModule],
  exports: [
    DsInfoComponent,
    TooltipComponent,
    ScaleComponent,
    HistogramComponent,
  ],
})
export class DsPagesCommonModule {}
