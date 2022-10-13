import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostUnitaryComponent } from './components/post-unitary/post-unitary.component';
import { PostResolver } from './resolvers/post.resolver';
import { PostsResolver } from './resolvers/posts.resolver';

const routes: Routes = [
  { path: '', component: PostListComponent, resolve: { posts: PostsResolver } },
  { path: ':id', component: PostUnitaryComponent, resolve: { post: PostResolver } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialNetworkRoutingModule { }
