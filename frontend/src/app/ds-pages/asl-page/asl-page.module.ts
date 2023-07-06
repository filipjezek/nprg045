import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AslPageComponent } from './asl-page.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DsPagesCommonModule } from '../common/ds-pages-common.module';
import { LinesGraphComponent } from './lines-graph/lines-graph.component';

@NgModule({
  declarations: [AslPageComponent, LinesGraphComponent],
  imports: [
    CommonModule,
    WidgetsModule,
    ReactiveFormsModule,
    DsPagesCommonModule,
  ],
})
export class AslPageModule {}
