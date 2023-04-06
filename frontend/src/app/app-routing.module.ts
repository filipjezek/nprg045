import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DsTabsComponent } from './common/ds-tabs/ds-tabs.component';
import { NotFoundComponent } from './common/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'datastore/:path',
    children: [
      {
        path: 'inspect',
        component: DsTabsComponent,
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
