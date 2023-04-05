import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsInfoComponent } from './ds-info/ds-info.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [DsInfoComponent],
  imports: [CommonModule, WidgetsModule, FontAwesomeModule],
  exports: [DsInfoComponent],
})
export class DsPagesCommonModule {}
