import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialNetworkRoutingModule } from './social-network-routing.module';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';
import { SharedModule } from '../shared/shared.module';
import { PostsService } from '../core/services/posts.service';
import { PostsResolver } from './resolvers/posts.resolver';
import { EllipsisModule } from 'ngx-ellipsis';
// import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PostListComponent,
    PostComponent
  ],
  imports: [
    CommonModule,
    SocialNetworkRoutingModule,
    SharedModule,
    EllipsisModule,
    // ReactiveFormsModule
  ],
  providers: [
    PostsService,
    PostsResolver
  ]
})
export class SocialNetworkModule { }
