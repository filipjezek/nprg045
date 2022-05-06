import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonRadioComponent } from './button-radio/button-radio.component';

@NgModule({
  declarations: [ButtonRadioComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [ButtonRadioComponent],
})
export class WidgetsModule {}
