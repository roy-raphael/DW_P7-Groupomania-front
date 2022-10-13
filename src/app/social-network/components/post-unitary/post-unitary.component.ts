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

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private postsService: PostsService) {}

  ngOnInit(): void {
    this.post$ = this.route.data.pipe(
      map(data => ({canEditAndDelete: this.authService.canEditAndDeletePost(data['post'].authorId), ...data['post']}))
    );
  }

  get newCommentSubject() {
    return this._newCommentSubject;
  }

  onPostCommented(postCommented: { comment: string, postId: string }) {
    this.postsService.addNewComment(postCommented.comment, postCommented.postId).pipe(
      map((comment: Comment) => this._newCommentSubject.next(comment))
    ).subscribe();
  }
}
