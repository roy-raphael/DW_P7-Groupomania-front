import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable()
export class PostsService {

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/posts`);
  }

  getOnePost(postId: string): Observable<Post> {
    return this.http.get<Post>(`${environment.apiUrl}/posts/${postId}`);
  }

  addNewComment(text: string, postId: string): Observable<Comment> {
    const authorId = this.authService.getUserId();
    if (authorId) {
      return this.http.post<Comment>(`${environment.apiUrl}/posts/${postId}/comment`, {text, authorId});
    } else {
      return EMPTY;
    }
  }
}