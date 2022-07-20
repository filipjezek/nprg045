import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonRadioComponent } from './button-radio/button-radio.component';
import { AcronymPipe } from './acronym.pipe';
import { RangeComponent } from './range/range.component';
import { KeyboardClickDirective } from './directives/keyboard-click.directive';

@NgModule({
  declarations: [
    ButtonRadioComponent,
    AcronymPipe,
    RangeComponent,
    KeyboardClickDirective,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    ButtonRadioComponent,
    AcronymPipe,
    RangeComponent,
    KeyboardClickDirective,
  ],
})
export class WidgetsModule {}
