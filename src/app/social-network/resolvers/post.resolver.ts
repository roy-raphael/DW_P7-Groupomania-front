import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, EMPTY, Observable } from 'rxjs';
import { Post } from 'src/app/core/models/post.model';
import { PostsService } from 'src/app/core/services/posts.service';

@Injectable()
export class PostResolver implements Resolve<Post> {
  constructor(private postsService: PostsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Post> {
    const postId = route.paramMap.get('id');
    if (postId == null) {
      return EMPTY;
    } else {
      return this.postsService.getOnePost(<string>postId).pipe(
        catchError(err => {
          console.log("Error during PostResolver : " + err.status + " - " + err.error.error.message);
          if (err.status === 404) {
            this.router.navigate(['login'], {skipLocationChange:true});
          }
          return EMPTY;
        })
      );
    }
  }
}