import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleValuePageComponent } from './single-value-page.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';

@NgModule({
  declarations: [SingleValuePageComponent],
  imports: [CommonModule, WidgetsModule],
})
export class SingleValuePageModule {}
