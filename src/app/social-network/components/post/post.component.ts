import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Post } from 'src/app/core/models/post.model';
import { EllipsisDirective } from 'ngx-ellipsis';
import { Comment } from 'src/app/core/models/comment.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {
  @ViewChild(EllipsisDirective) ellipsisRef!: EllipsisDirective; // aim : tell the directive (from the template) to update
  @Input() post!: Post;
  @Input() newComment$!: Observable<Comment>;
  @Input() postLikeUpdate$!: Observable<Post>;
  @Input() noMoreCommentToLoad$!: Observable<string>;
  @Output() postCommented = new EventEmitter<{ comment: string, postId: string }>();
  @Output() postLiked = new EventEmitter<{ like: boolean, postId: string }>();
  @Output() loadComments = new EventEmitter<{ before?: Date, postId: string }>();
  private newCommentSubscription!: Subscription;
  private postLikeUpdateSubscription!: Subscription;
  private noMoreCommentToLoadSubscription!: Subscription;
  hasBeenEdited: boolean = false;
  hasSomeComment: boolean = false;
  hasSeveralComments: boolean = false;
  seeMore: boolean = false; // If we want to display the truncated part of the text (-> true)
  seeMoreButton: boolean = false; // If we want to display a "See more" button (-> true)
  noMoreCommentToLoad: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Calling detectChanges here is the workaround for not having the error "ExpressionChangedAfterItHasBeenCheckedError" (for seeMoreButton)
    this.cdr.detectChanges();
    this.ellipsisRef.applyEllipsis();
    this.newCommentSubscription = this.newComment$.subscribe((comment: Comment) => {
      if (comment.postId === this.post.id) {
        this.post.comments.push(comment);
        this.cdr.detectChanges(); // because parent also has OnPush ChangeDetectionStrategy
      }
    });
    this.postLikeUpdateSubscription = this.postLikeUpdate$.subscribe((post: Post) => {
      if (post.id === this.post.id) {
        this.post.likes = post.likes;
        this.post.likesNumber = post.likesNumber;
        this.post.userLiked = post.userLiked;
        this.cdr.detectChanges(); // because parent also has OnPush ChangeDetectionStrategy
      }
    });
    this.noMoreCommentToLoadSubscription = this.noMoreCommentToLoad$.subscribe((postId: string) => {
      if (postId === this.post.id) {
        this.noMoreCommentToLoad = true;
        this.cdr.detectChanges(); // because parent also has OnPush ChangeDetectionStrategy
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    const postChanges = changes['post'];
    if (postChanges) {
      const newPost: Post = postChanges.currentValue;
      if (newPost != null) {
        this.hasBeenEdited = newPost.createdAt !== newPost.updatedAt;
        const commentsNumber = newPost._count.comments;
        this.hasSomeComment = commentsNumber ? (commentsNumber !== 0) : false;
        this.hasSeveralComments = commentsNumber ? (commentsNumber > 1) : false;
        this.noMoreCommentToLoad = this.post.comments.length >= commentsNumber;
      }
    }
  }

  ngOnDestroy() {
    this.newCommentSubscription.unsubscribe();
    this.postLikeUpdateSubscription.unsubscribe();
    this.noMoreCommentToLoadSubscription.unsubscribe();
  }

  // Saves if the text has been truncated or not
  truncated(index: number) {
    this.seeMoreButton = index !== null;
  }

  // Shows the text completely
  showComplete() {
    if (this.ellipsisRef) {
      this.seeMore = true;
      this.cdr.detectChanges();
      this.ellipsisRef.applyEllipsis();
    }
  }

  // Shows the text with an ellipsis (truncated)
  showTruncated() {
    if (this.ellipsisRef) {
      this.seeMore = false;
      this.cdr.detectChanges();
      this.ellipsisRef.applyEllipsis();
    }
  }

  onNewComment(comment: string) {
    this.postCommented.emit({ comment, postId: this.post.id });
  }

  onLike() {
    this.postLiked.emit({ like: !this.post.userLiked, postId: this.post.id });
  }

  onloadMoreComments() {
    const lastComment : Comment = this.post.comments[this.post.comments.length - 1];
    this.loadComments.emit({ before: lastComment ? lastComment.createdAt : undefined, postId: this.post.id });
  }
}
