import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Subject, take, tap } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-unitary',
  templateUrl: './post-unitary.component.html',
  styleUrls: ['./post-unitary.component.scss']
})
export class PostUnitaryComponent implements OnInit {
  post!: Post;
  private _newCommentSubject: Subject<Comment> = new Subject();
  private _noMoreCommentToLoadSubject: Subject<string> = new Subject();

  constructor(private route: ActivatedRoute,
              private postsService: PostsService) {}

  ngOnInit(): void {
    this.route.data.pipe(
      map(data => data['post']),
      take(1),
      tap((post: Post) => this.post = {...this.postsService.completePostInfos(post)}),
    ).subscribe();
  }

  get newCommentSubject() {
    return this._newCommentSubject;
  }

  get noMoreCommentToLoadSubject() {
    return this._noMoreCommentToLoadSubject;
  }

  onPostCommented(postCommented: { comment: string, postId: string }) {
    this.postsService.addNewComment(postCommented.comment, postCommented.postId).pipe(
      map((comment: Comment) => this._newCommentSubject.next(comment))
    ).subscribe();
  }

  onPostLiked(postLiked: { like: boolean, postId: string }) {
    this.postsService.likePost(postLiked.like, postLiked.postId).pipe(
      tap(post => {
        const updatedPost = this.postsService.completePostInfos(post);
        this.post.likes = updatedPost.likes;
        this.post.likesNumber = updatedPost.likesNumber;
        this.post.userLiked = updatedPost.userLiked;
      })
    ).subscribe();
  }

  onLoadComments(params: { before?: Date, postId: string }) {
    this.postsService.getComments(params.postId, params.before).pipe(
      tap(() => console.log("onLoadComments for postId : " + params.postId)),
      tap(comments => {
        if (params.postId === this.post.id) {
          if (comments) {
            if (comments.length > 0) {
              console.log("PostComponent:moreComments good component");
              this.post.comments.push(...comments);
              if (this.post.comments.length >= this.post._count.comments) {
                this._noMoreCommentToLoadSubject.next(params.postId);
              }
            }
          }
        }
      }),
    ).subscribe();
  }
}
