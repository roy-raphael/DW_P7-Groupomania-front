import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  private _newCommentSubject: Subject<Comment> = new Subject();

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private postsService: PostsService) { }

  ngOnInit(): void {
    this.posts$ = this.route.data.pipe(
      map(data => data['posts'].map((post: Post) => ({canEditAndDelete: this.authService.canEditAndDeletePost(post.authorId), ...post})))
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
