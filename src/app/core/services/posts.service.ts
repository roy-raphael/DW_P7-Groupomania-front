import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service';

const GET_POSTS_LIMIT: number = 10;
const GET_POSTS_COMMENTS_LIMIT: number = 0;
const GET_POST_COMMENTS_LIMIT: number = 10;
const GET_COMMENTS_LIMIT: number = 10;

@Injectable()
export class PostsService {

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  getPostsLimit(): number {
    return GET_POSTS_LIMIT;
  }

  getPosts(before?: Date): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/posts?limit=${GET_POSTS_LIMIT}${before ? "&before=" + before : ""}&comments-limit=${GET_POSTS_COMMENTS_LIMIT}`);
  }

  getOnePost(postId: string): Observable<Post> {
    return this.http.get<Post>(`${environment.apiUrl}/posts/${postId}?comments-limit=${GET_POST_COMMENTS_LIMIT}`);
  }

  getComments(postId: string, before?: Date): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/posts/${postId}/comments?limit=${GET_COMMENTS_LIMIT}${before ? "&before=" + before : ""}`);
  }

  addNewComment(text: string, postId: string): Observable<Comment> {
    const authorId = this.authService.userId;
    if (authorId) {
      return this.http.post<Comment>(`${environment.apiUrl}/posts/${postId}/comment`, {text, authorId});
    } else {
      return EMPTY;
    }
  }

  likePost(postLiked: boolean, postId: string): Observable<Post> {
    const userId = this.authService.userId;
    if (userId) {
      const like = Number(postLiked);
      return this.http.post<Post>(`${environment.apiUrl}/posts/${postId}/like`, {userId, like});
    } else {
      return EMPTY;
    }
  }

  completePostInfos(post: Post): Post {
    return {
      likesNumber: post.likes.length,
      userLiked: this.authService.containsCurrentUser(post.likes),
      canEditAndDelete: this.authService.canEditAndDeletePost(post.authorId),
      ...post,
      comments: post.comments.reverse()
    };
  }
}