import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { catchError, EMPTY, Observable } from 'rxjs';
import { Post } from 'src/app/core/models/post.model';
import { MessageHandlingService } from 'src/app/core/services/message-handling.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Injectable()
export class PostsResolver implements Resolve<Post[]> {
  constructor(private postsService: PostsService,
              private messagehandlingService: MessageHandlingService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Post[]> {
    return this.postsService.getPosts().pipe(
      catchError(err => {
        this.messagehandlingService.displayError("Erreur pendant la récupération des publications.");
        console.log("Error during PostsResolver : " + err.status + " - " + err.error.error.message);
        return EMPTY;
      })
    );
  }
}