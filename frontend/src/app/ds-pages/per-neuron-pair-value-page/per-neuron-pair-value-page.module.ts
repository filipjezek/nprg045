import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerNeuronPairValuePageComponent } from './per-neuron-pair-value-page.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DsPagesCommonModule } from '../common/ds-pages-common.module';
import { MatrixComponent } from './matrix/matrix.component';

@NgModule({
  declarations: [PerNeuronPairValuePageComponent, MatrixComponent],
  imports: [
    CommonModule,
    WidgetsModule,
    ReactiveFormsModule,
    DsPagesCommonModule,
  ],
})
export class PerNeuronPairValuePageModule {}
