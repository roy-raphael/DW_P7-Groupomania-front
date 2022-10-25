import { animate, animateChild, group, query, sequence, stagger, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { flashAnimation } from 'src/app/shared/animations/flash.animation';
import { slideAndFadeAnimation } from 'src/app/shared/animations/slide-and-fade.animation';
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  animations: [
    trigger('list', [
      transition(':enter', [
        query('@listItem', [
          animateChild()
        ])
      ])
    ]),
    trigger('listItem', [
      transition(':enter', [
        query('.comment-text, .comment-date', [
          style({
            opacity: 0
          }),
        ]),
        useAnimation(slideAndFadeAnimation),
        group([
          useAnimation(flashAnimation),
          query('.comment-text', [
            animate('250ms', style({
              opacity: 1
            }))
          ]),
          query('.comment-date', [
            animate('500ms', style({
              opacity: 1
            }))
          ]),
      ]),
      ])
    ])
  ]
})
export class CommentsComponent implements OnInit {

  @Input() comments!: Comment[];
  @Input() showComments!: boolean;
  @Input() noMoreCommentToLoad!: boolean;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Output() newComment = new EventEmitter<string>();
  @Output() loadMoreComments = new EventEmitter<void>();

  commentCtrl!: FormControl;
  animationStates: { [key: number]: 'default' | 'active' } = {};
  listItemAnimationState: 'default' | 'active' = 'default';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.commentCtrl = this.formBuilder.control('', [Validators.required])
    for (let index in this.comments) {
      this.animationStates[index] = 'default';
    }
  }

  onLeaveComment() {
    if (this.commentCtrl.invalid) {
      return;
    }
    this.newComment.emit(this.commentCtrl.value);
    this.commentCtrl.reset();
  }

  onListItemMouseEnter(index: number) {
    this.animationStates[index] = 'active';
  }

  onListItemMouseLeave(index: number) {
    this.animationStates[index] = 'default';
  }

  loadMore() {
    this.loadMoreComments.emit();
  }
}
