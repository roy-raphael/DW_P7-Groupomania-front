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
import { PostUnitaryComponent } from './components/post-unitary/post-unitary.component';
import { PostResolver } from './resolvers/post.resolver';


@NgModule({
  declarations: [
    PostListComponent,
    PostComponent,
    PostUnitaryComponent
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
    PostsResolver,
    PostResolver
  ]
})
export class SocialNetworkModule { }
