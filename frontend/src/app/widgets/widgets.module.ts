import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonRadioComponent } from './button-radio/button-radio.component';
import { AcronymPipe } from './pipes/acronym.pipe';
import { RangeComponent } from './range/range.component';
import { KeyboardClickDirective } from './directives/keyboard-click.directive';
import { ScientificPipe } from './pipes/scientific.pipe';

@NgModule({
  declarations: [
    ButtonRadioComponent,
    AcronymPipe,
    RangeComponent,
    KeyboardClickDirective,
    ScientificPipe,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    ButtonRadioComponent,
    AcronymPipe,
    RangeComponent,
    KeyboardClickDirective,
    ScientificPipe,
  ],
})
export class WidgetsModule {}
