import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonRadioComponent } from './button-radio/button-radio.component';
import { AcronymPipe } from './acronym.pipe';

@NgModule({
  declarations: [ButtonRadioComponent, AcronymPipe],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [ButtonRadioComponent, AcronymPipe],
})
export class WidgetsModule {}
