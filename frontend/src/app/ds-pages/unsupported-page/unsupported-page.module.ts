import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnsupportedPageComponent } from './unsupported-page.component';
import { DsPagesCommonModule } from '../common/ds-pages-common.module';

@NgModule({
  declarations: [UnsupportedPageComponent],
  imports: [CommonModule, DsPagesCommonModule],
})
export class UnsupportedPageModule {}
