import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialNetworkRoutingModule } from './posts-routing.module';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostComponent } from './components/post/post.component';
import { SharedModule } from '../shared/shared.module';
import { PostsService } from '../core/services/posts.service';
import { PostsResolver } from './resolvers/posts.resolver';
import { EllipsisModule } from 'ngx-ellipsis';
import { CommentsComponent } from './components/comments/comments.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PostUnitaryComponent } from './components/post-unitary/post-unitary.component';
import { PostResolver } from './resolvers/post.resolver';
import { PageNotFoundModule } from '../page-not-found/page-not-found.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PostFormComponent } from './components/post-form/post-form.component';


@NgModule({
  declarations: [
    PostListComponent,
    PostComponent,
    PostUnitaryComponent,
    CommentsComponent,
    PostFormComponent,
  ],
  imports: [
    CommonModule,
    SocialNetworkRoutingModule,
    SharedModule,
    EllipsisModule,
    PageNotFoundModule,
    ReactiveFormsModule,
    InfiniteScrollModule
  ],
  providers: [
    PostsService,
    PostsResolver,
    PostResolver
  ]
})
export class SocialNetworkModule { }
