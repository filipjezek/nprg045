import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelPageRoutingModule } from './model-page-routing.module';
import { ModelPageComponent } from './model-page.component';


@NgModule({
  declarations: [
    ModelPageComponent
  ],
  imports: [
    CommonModule,
    ModelPageRoutingModule
  ]
})
export class ModelPageModule { }
