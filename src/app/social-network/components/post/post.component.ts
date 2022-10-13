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
  @Output() postCommented = new EventEmitter<{ comment: string, postId: string }>();
  private newCommentSubscription!: Subscription;
  hasBeenEdited: boolean = false;
  seeMore: boolean = false; // If we want to display the truncated part of the text (-> true)
  seeMoreButton: boolean = false; // If we want to display a "See more" button (-> true)

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Calling detectChanges here is the workaround for not having the error "ExpressionChangedAfterItHasBeenCheckedError" (for seeMoreButton)
    this.cdr.detectChanges();
    this.ellipsisRef.applyEllipsis();
    this.newCommentSubscription = this.newComment$.subscribe((comment: Comment) => {
      if (comment.postId === this.post.id) {
        this.post.comments.push(comment);
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    const postChanges = changes['post'];
    if (postChanges) {
      const newPost: Post = postChanges.currentValue;
      if (newPost != null) {
        this.hasBeenEdited = newPost.createdAt !== newPost.updatedAt;
      }
    }
  }

  ngOnDestroy() {
    this.newCommentSubscription.unsubscribe();
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
}
