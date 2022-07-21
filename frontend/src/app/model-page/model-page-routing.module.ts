import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdsIdentifier } from '../store/reducers/ads.reducer';
import { ModelPageComponent } from './model-page.component';

const routes: Routes = [
  {
    path: 'pnv/:adsIndex',
    component: ModelPageComponent,
    data: { ads: AdsIdentifier.PerNeuronValue },
  },
  { path: '', pathMatch: 'full', component: ModelPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelPageRoutingModule {
  constructor() {}
}
