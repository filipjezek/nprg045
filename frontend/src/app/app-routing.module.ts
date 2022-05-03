import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'model',
    loadChildren: () =>
      import('./model-page/model-page.module').then((m) => m.ModelPageModule),
  },
  { path: '', redirectTo: 'model', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
