import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'social-network', loadChildren: () => import('./social-network/social-network.module').then(m => m.SocialNetworkModule) },
  { path: 'post-form', loadChildren: () => import('./post-form/post-form.module').then(m => m.PostFormModule), },
  { path: '**', redirectTo: 'social-network'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
