import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { Comment } from 'src/app/core/models/comment.model';
import { Post } from 'src/app/core/models/post.model';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-post-unitary',
  templateUrl: './post-unitary.component.html',
  styleUrls: ['./post-unitary.component.scss']
})
export class PostUnitaryComponent implements OnInit {
  post$!: Observable<Post>;
  private _newCommentSubject: Subject<Comment> = new Subject();
  private _postLikeUpdateSubject: Subject<Post> = new Subject();

  constructor(private route: ActivatedRoute,
              private postsService: PostsService) {}

  ngOnInit(): void {
    this.post$ = this.route.data.pipe(
      map(data => data['post']),
      map((post: Post) => this.postsService.completePostInfos(post))
    );
  }

  get newCommentSubject() {
    return this._newCommentSubject;
  }

  get postLikeUpdateSubject() {
    return this._postLikeUpdateSubject;
  }

  onPostCommented(postCommented: { comment: string, postId: string }) {
    this.postsService.addNewComment(postCommented.comment, postCommented.postId).pipe(
      map((comment: Comment) => this._newCommentSubject.next(comment))
    ).subscribe();
  }

  onPostLiked(postLiked: { like: boolean, postId: string }) {
    this.postsService.likePost(postLiked.like, postLiked.postId).pipe(
      map(post => this._postLikeUpdateSubject.next(this.postsService.completePostInfos(post)))
    ).subscribe();
  }
}
