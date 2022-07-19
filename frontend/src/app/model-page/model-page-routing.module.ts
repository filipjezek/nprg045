import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelPageComponent } from './model-page.component';

const routes: Routes = [
  { path: 'pnv/:index', component: ModelPageComponent },
  { path: '', pathMatch: 'full', component: ModelPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelPageRoutingModule {
  constructor() {}
}
