import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './common/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'datastore/:path',
    children: [
      {
        path: 'model',
        loadChildren: () =>
          import('./model-page/model-page.module').then(
            (m) => m.ModelPageModule
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'model' },
    ],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
