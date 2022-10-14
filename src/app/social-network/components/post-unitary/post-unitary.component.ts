import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-unitary',
  templateUrl: './post-unitary.component.html',
  styleUrls: ['./post-unitary.component.scss']
})
export class PostUnitaryComponent implements OnInit {
  post$!: Observable<Post>;
  private _newCommentSubject: Subject<Comment> = new Subject();
  private _postLikeUpdateSubject: Subject<Post> = new Subject();

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private postsService: PostsService) {}

  ngOnInit(): void {
    this.post$ = this.route.data.pipe(
      map(data => ({likesNumber: data['post'].likes.length,
                    userLiked: this.authService.containsCurrentUser(data['post'].likes),
                    canEditAndDelete: this.authService.canEditAndDeletePost(data['post'].authorId),
                    ...data['post']}))
    );
  }

  get newCommentSubject() {
    return this._newCommentSubject;
  }

  get postLikeUpdateSubject() {
    return this._postLikeUpdateSubject;
  }

  onPostCommented(postCommented: { comment: string, postId: string }) {
    this.postsService.addNewComment(postCommented.comment, postCommented.postId).pipe(
      map((comment: Comment) => this._newCommentSubject.next(comment))
    ).subscribe();
  }

  onPostLiked(postLiked: { like: boolean, postId: string }) {
    this.postsService.likePost(postLiked.like, postLiked.postId).pipe(
      map(post => this._postLikeUpdateSubject.next({
        likesNumber: post.likes.length,
        userLiked: this.authService.containsCurrentUser(post.likes),
        canEditAndDelete: this.authService.canEditAndDeletePost(post.authorId),
        ...post}))
    ).subscribe();
  }
}
