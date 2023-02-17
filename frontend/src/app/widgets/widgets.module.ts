import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonRadioComponent } from './button-radio/button-radio.component';
import { AcronymPipe } from './pipes/acronym.pipe';
import { RangeComponent } from './range/range.component';
import { KeyboardClickDirective } from './directives/keyboard-click.directive';
import { ScientificPipe } from './pipes/scientific.pipe';
import {
  CategoryListComponent,
  WrapPipe,
} from './category-list/category-list.component';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProgressComponent } from './progress/progress.component';
import { TimePipe } from './pipes/time.pipe';

@NgModule({
  declarations: [
    ButtonRadioComponent,
    AcronymPipe,
    RangeComponent,
    KeyboardClickDirective,
    ScientificPipe,
    CategoryListComponent,
    WrapPipe,
    ProgressComponent,
    TimePipe,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FontAwesomeModule],
  exports: [
    ButtonRadioComponent,
    AcronymPipe,
    RangeComponent,
    KeyboardClickDirective,
    ScientificPipe,
    CategoryListComponent,
    ProgressComponent,
    TimePipe,
  ],
})
export class WidgetsModule {}
