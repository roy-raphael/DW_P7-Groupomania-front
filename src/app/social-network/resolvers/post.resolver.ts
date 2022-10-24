import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { catchError, EMPTY, Observable } from 'rxjs';
import { Post } from 'src/app/core/models/post.model';
import { MessageHandlingService } from 'src/app/core/services/message-handling.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Injectable()
export class PostResolver implements Resolve<Post> {
  constructor(private postsService: PostsService,
              private messagehandlingService: MessageHandlingService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Post> {
    const postId = route.paramMap.get('id');
    if (postId == null) {
      return EMPTY;
    } else {
      return this.postsService.getOnePost(<string>postId).pipe(
        catchError(err => {
          this.messagehandlingService.displayError("Erreur pendant la récupération de la publication.");
          console.log("Error during PostResolver : " + err.status + " - " + err.error.error.message);
          return EMPTY;
        })
      );
    }
  }
}