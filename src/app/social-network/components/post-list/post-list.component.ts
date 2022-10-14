import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject, take, tap } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  postsList: Post[] = [];
  postsSubject$: Subject<Post[]> = new Subject<Post[]>();
  private _newCommentSubject: Subject<Comment> = new Subject();
  private _postLikeUpdateSubject: Subject<Post> = new Subject();
  private _lastPostDate!: Date;
  noMorePostToLoad: boolean = false;

  constructor(private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private authService: AuthService,
              private postsService: PostsService) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.route.data.pipe(
      map(data => data['posts']),
      take(1),
      map(posts => posts.map((post: Post) => ({
        likesNumber: post.likes.length,
        userLiked: this.authService.containsCurrentUser(post.likes),
        canEditAndDelete: this.authService.canEditAndDeletePost(post.authorId),
        ...post
      }))),
      tap((posts: Post[]) => this.onNewPosts(posts))
    ).subscribe();
  }

  get newCommentSubject() {
    return this._newCommentSubject;
  }

  get postLikeUpdateSubject() {
    return this._postLikeUpdateSubject;
  }

  loadMore() {
    this.postsService.getSomePosts(this._lastPostDate).pipe(
      take(1),
      map((posts: Post[]) => posts.map((post: Post) => ({
        likesNumber: post.likes.length,
        userLiked: this.authService.containsCurrentUser(post.likes),
        canEditAndDelete: this.authService.canEditAndDeletePost(post.authorId),
        ...post
      }))),
      tap((posts: Post[]) => this.onNewPosts(posts))
    ).subscribe();
  }

  onNewPosts(posts: Post[]): void {
    if (posts.length > 0) {
      posts.forEach(post => this.postsList.push(post));
      const lastPost = [...posts].pop();
      if (lastPost) {
        this._lastPostDate = lastPost.createdAt;
      }
      this.postsSubject$.next(this.postsList);
      this.cdr.detectChanges();
    }
    if (!this.noMorePostToLoad && posts.length < this.postsService.getPostsLimit()) {
      this.noMorePostToLoad = true;
      this.cdr.detectChanges();
    }
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
