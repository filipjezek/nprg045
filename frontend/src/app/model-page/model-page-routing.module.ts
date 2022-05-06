import { NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ModelPageComponent } from './model-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ModelPageComponent },
];

export enum EdgeDirection {
  incoming,
  outcoming,
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelPageRoutingModule {
  constructor(private fb: FormBuilder) {}
}
