import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
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

  addNewComment(text: string, postId: string) {
    const authorId = this.authService.getUserId();
    if (authorId) {
      this.http.post<{text: string, authorId: string}>(`${environment.apiUrl}/posts/${postId}/comment`, {text, authorId}).subscribe();
    }
  }
}