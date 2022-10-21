import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @Input() commentsListChanged$!: Observable<string>;
  @Input() deletePostError$!: Observable<string>;
  @Input() isUnitaryPost!: boolean;
  @Output() postCommented = new EventEmitter<{ comment: string, postId: string }>();
  @Output() postLiked = new EventEmitter<{ like: boolean, postId: string }>();
  @Output() loadComments = new EventEmitter<{ before?: Date, postId: string }>();
  @Output() viewPost = new EventEmitter<string>();
  @Output() deletePost = new EventEmitter<string>();
  private commentsListChangedSubscription!: Subscription;
  private deletePostErrorSubscription!: Subscription;
  hasBeenEdited: boolean = false;
  seeMore: boolean = false; // If we want to display the truncated part of the text (-> true)
  seeMoreButton: boolean = false; // If we want to display a "See more" button (-> true)
  noMoreCommentToLoad: boolean = true;
  showComments: boolean = false;
  commentsLoading: boolean = false;
  deleteLoading: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.post != null) {
      this.hasBeenEdited = this.post.createdAt !== this.post.updatedAt;
      this.showComments = this.post._count.comments > 0 && this.post.comments.length > 0;
    }
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
    this.deletePostErrorSubscription = this.deletePostError$.subscribe((postId: string) => {
      if (postId === this.post.id) {
        this.deleteLoading = false;
        console.error("Error during Post Delete");
        // TODO display error pop-up
        this.cdr.detectChanges(); // because parent also has OnPush ChangeDetectionStrategy
      }
    });
  }

  ngOnDestroy() {
    this.commentsListChangedSubscription.unsubscribe();
    this.deletePostErrorSubscription.unsubscribe();
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

  onViewPostClicked() {
    this.viewPost.emit(this.post.id);
  }

  onDeletePostClicked() {
    this.deleteLoading = true;
    this.deletePost.emit(this.post.id);
  }
}
