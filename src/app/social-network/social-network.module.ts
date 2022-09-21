import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialNetworkRoutingModule } from './social-network-routing.module';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';


@NgModule({
  declarations: [
    PostListComponent,
    PostComponent
  ],
  imports: [
    CommonModule,
    SocialNetworkRoutingModule
  ]
})
export class SocialNetworkModule { }
