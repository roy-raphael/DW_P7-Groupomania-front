import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Subject, take, tap } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { MessageHandlingService } from 'src/app/core/services/message-handling.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-unitary',
  templateUrl: './post-unitary.component.html',
  styleUrls: ['./post-unitary.component.scss']
})
export class PostUnitaryComponent implements OnInit {
  post!: Post;
  private _commentsListChangedSubject: Subject<string> = new Subject();
  private _deletePostErrorSubject: Subject<string> = new Subject();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private postsService: PostsService,
              private messagehandlingService: MessageHandlingService) {}

  ngOnInit(): void {
    this.route.data.pipe(
      map(data => data['post']),
      take(1),
      tap((post: Post) => this.post = {...this.postsService.completePostInfos(post)}),
    ).subscribe();
  }

  get commentsListChangedSubject() {
    return this._commentsListChangedSubject;
  }

  get deletePostErrorSubject() {
    return this._deletePostErrorSubject;
  }

  onPostCommented(postCommented: { comment: string, postId: string }) {
    this.postsService.addNewComment(postCommented.comment, postCommented.postId).pipe(
      tap((comment: Comment) => {
        if (postCommented.postId === this.post.id) {
          if (comment) {
            this.post._count.comments++;
            this.post.comments.push(comment);
          }
        } else {
          this.messagehandlingService.displayError("Erreur pendant la création d'un commentaire.");
          console.error("Error during PostUnitaryComponent:onLoadComments : the post does not correspond to the post ID " + postCommented.postId);
        }
      })
    ).subscribe();
  }

  onPostLiked(postLiked: { like: boolean, postId: string }) {
    this.postsService.likePost(postLiked.like, postLiked.postId).pipe(
      tap(post => {
        if (postLiked.postId === this.post.id) {
          const updatedPost = this.postsService.completePostInfos(post);
          this.post.likes = updatedPost.likes;
          this.post.likesNumber = updatedPost.likesNumber;
          this.post.userLiked = updatedPost.userLiked;
        } else {
          this.messagehandlingService.displayError("Erreur pendant le like/unlike de la publication.");
          console.error("Error during PostUnitaryComponent:onPostLiked : the post does not correspond to the post ID " + postLiked.postId);
        }
      })
    ).subscribe();
  }

  onLoadComments(params: { before?: Date, postId: string }) {
    this.postsService.getComments(params.postId, params.before).pipe(
      tap(comments => {
        if (params.postId === this.post.id) {
          if (comments) {
            if (comments.length > 0) {
              this.post.comments.unshift(...comments.reverse());
              this._commentsListChangedSubject.next(params.postId);
            }
          }
        } else {
          this.messagehandlingService.displayError("Erreur pendant le chargement de commentaires.");
          console.error("Error during PostUnitaryComponent:onLoadComments : the post does not correspond to the post ID " + params.postId);
        }
      }),
    ).subscribe();
  }

  onDeletePost(postId: string) {
    this.postsService.deletePost(postId).pipe(
      tap(() => {
        this.router.navigate(['']);
      }),
      catchError(error => {
        this._deletePostErrorSubject.next(postId);
        throw error;
      })
    ).subscribe();
  }
}
