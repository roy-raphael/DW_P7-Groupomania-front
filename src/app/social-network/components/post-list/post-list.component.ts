import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject, take, tap } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostListComponent implements OnInit {
  postsList: Post[] = [];
  private _noMoreCommentToLoadSubject: Subject<string> = new Subject();
  private _lastPostDate!: Date;
  noMorePostToLoad: boolean = false;

  constructor(private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private postsService: PostsService) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.route.data.pipe(
      map(data => data['posts']),
      take(1),
      tap((posts: Post[]) => this.onNewPosts(posts))
    ).subscribe();
  }

  get noMoreCommentToLoadSubject() {
    return this._noMoreCommentToLoadSubject;
  }

  loadMore() {
    this.postsService.getPosts(this._lastPostDate).pipe(
      take(1),
      tap((posts: Post[]) => this.onNewPosts(posts))
    ).subscribe();
  }

  onNewPosts(posts: Post[]): void {
    if (posts.length > 0) {
      posts.forEach((post: Post) => this.postsList.push(this.postsService.completePostInfos(post)));
      const lastPost = [...posts].pop();
      if (lastPost) {
        this._lastPostDate = lastPost.createdAt;
      }
      this.cdr.detectChanges(); // because this component has OnPush ChangeDetectionStrategy, and the input reference is not modified...
    }
    if (!this.noMorePostToLoad && posts.length < this.postsService.getPostsLimit()) {
      this.noMorePostToLoad = true;
      this.cdr.detectChanges();
    }
  }

  onPostLiked(postLiked: { like: boolean, postId: string }) {
    this.postsService.likePost(postLiked.like, postLiked.postId).pipe(
      tap(post => {
        const postIndex = this.postsList.findIndex(post => post.id === postLiked.postId);
        if (postIndex !== -1) {
          const updatedPost = this.postsService.completePostInfos(post);
          this.postsList[postIndex].likes = updatedPost.likes;
          this.postsList[postIndex].likesNumber = updatedPost.likesNumber;
          this.postsList[postIndex].userLiked = updatedPost.userLiked;
          this.cdr.detectChanges(); // because this component has OnPush ChangeDetectionStrategy, and the input reference is not modified...
        } else {
          console.error("Error during PostListComponent:onPostLiked : no post found in the list with ID " + postLiked.postId);
        }
      })
    ).subscribe();
  }

  onPostCommented(postCommented: { comment: string, postId: string }) {
    this.postsService.addNewComment(postCommented.comment, postCommented.postId).pipe(
      tap((comment: Comment) => {
        const postIndex = this.postsList.findIndex(post => post.id === postCommented.postId);
        if (postIndex !== -1) {
          if (comment) {
            this.postsList[postIndex]._count.comments++;
            this.postsList[postIndex].comments.unshift(comment);;
            this.cdr.detectChanges(); // because this component has OnPush ChangeDetectionStrategy, and the input reference is not modified...
          }
        } else {
          console.error("Error during PostListComponent:onPostCommented : no post found in the list with ID " + postCommented.postId);
        }
      })
    ).subscribe();
  }

  onLoadComments(params: { before?: Date, postId: string }) {
    this.postsService.getComments(params.postId, params.before).pipe(
      tap((comments: Comment[]) => {
        const postIndex = this.postsList.findIndex(post => post.id === params.postId);
        if (postIndex !== -1) {
          if (comments.length > 0) {
            this.postsList[postIndex].comments.push(...comments);
            this.cdr.detectChanges(); // because this component has OnPush ChangeDetectionStrategy, and the input reference is not modified...
            if (this.postsList[postIndex].comments.length >= this.postsList[postIndex]._count.comments) {
              this._noMoreCommentToLoadSubject.next(params.postId);
            }
          }
        } else {
          console.error("Error during PostListComponent:onLoadComments : no post found in the list with ID " + params.postId);
        }
      })
    ).subscribe();
  }
}
