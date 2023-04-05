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
import { CollapsibleComponent } from './collapsible/collapsible.component';
import { MultiviewComponent } from './multiview/multiview.component';
import { MultiviewPartitionComponent } from './multiview/multiview-partition/multiview-partition.component';
import { PurefnPipe } from './pipes/purefn.pipe';
import { KeyValueNoSortPipe } from './pipes/keyvaluenosort.pipe';
import { PaginationComponent } from './pagination/pagination.component';
import { InputComponent } from './input/input.component';
import { ButtonComponent } from './button/button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DraggableDirective } from './directives/draggable.directive';
import { PropertyBagComponent } from './property-bag/property-bag.component';

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
    CollapsibleComponent,
    MultiviewComponent,
    MultiviewPartitionComponent,
    PurefnPipe,
    KeyValueNoSortPipe,
    PaginationComponent,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
    DraggableDirective,
    PropertyBagComponent,
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
    CollapsibleComponent,
    MultiviewComponent,
    MultiviewPartitionComponent,
    PurefnPipe,
    KeyValueNoSortPipe,
    PaginationComponent,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
    DraggableDirective,
    PropertyBagComponent,
  ],
})
export class WidgetsModule {}
