import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Post } from 'src/app/core/models/post.model';
import { EllipsisDirective } from 'ngx-ellipsis';
import { Comment } from 'src/app/core/models/comment.model';
import { Observable, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {
  @ViewChild(EllipsisDirective) ellipsisRef!: EllipsisDirective; // aim : tell the directive (from the template) to update
  @Input() post!: Post;
  @Input() commentsListChanged$!: Observable<string>;
  @Output() postCommented = new EventEmitter<{ comment: string, postId: string }>();
  @Output() postLiked = new EventEmitter<{ like: boolean, postId: string }>();
  @Output() loadComments = new EventEmitter<{ before?: Date, postId: string }>();
  private commentsListChangedSubscription!: Subscription;
  hasBeenEdited: boolean = false;
  seeMore: boolean = false; // If we want to display the truncated part of the text (-> true)
  seeMoreButton: boolean = false; // If we want to display a "See more" button (-> true)
  noMoreCommentToLoad: boolean = true;
  showComments: boolean = false;
  commentsLoading: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Calling detectChanges here is the workaround for not having the error "ExpressionChangedAfterItHasBeenCheckedError" (for seeMoreButton)
    this.cdr.detectChanges();
    this.ellipsisRef.applyEllipsis();
    this.commentsListChangedSubscription = this.commentsListChanged$.subscribe((postId: string) => {
      if (postId === this.post.id) {
        this.commentsLoading = false;
        this.noMoreCommentToLoad = this.post.comments.length >= this.post._count.comments;
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
        this.noMoreCommentToLoad = newPost.comments.length >= newPost._count.comments;
        // only at startup
        this.showComments = newPost._count.comments > 0 && newPost.comments.length > 0;
      }
    }
  }

  ngOnDestroy() {
    this.commentsListChangedSubscription.unsubscribe();
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
    this.showComments = true;
  }

  onLike() {
    this.postLiked.emit({ like: !this.post.userLiked, postId: this.post.id });
  }

  onloadMoreComments() {
    this.commentsLoading = true;
    const oldestComment : Comment = this.post.comments[0];
    this.loadComments.emit({ before: oldestComment ? oldestComment.createdAt : undefined, postId: this.post.id });
  }

  hideOrShowComments() {
    if (!this.showComments) {
      if (this.post._count.comments > 0 && this.post.comments.length === 0) {
        this.onloadMoreComments();
      }
    }
    this.showComments = !this.showComments;
  }
}
