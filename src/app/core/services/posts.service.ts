import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service';
import { MessageHandlingService } from './message-handling.service';

const GET_POSTS_LIMIT: number = 10;
const GET_POSTS_COMMENTS_LIMIT: number = 0;
const GET_POST_COMMENTS_LIMIT: number = 10;
const GET_COMMENTS_LIMIT: number = 10;

@Injectable()
export class PostsService {

  constructor(private http: HttpClient,
              private authService: AuthService,
              private messagehandlingService: MessageHandlingService) {}

  getPostsLimit(): number {
    return GET_POSTS_LIMIT;
  }

  getPosts(before?: Date): Observable<Post[]> {
    const url = `${environment.apiUrl}/posts?limit=${GET_POSTS_LIMIT}${before ? "&before=" + before : ""}&comments-limit=${GET_POSTS_COMMENTS_LIMIT}`;
    return this.http.get<Post[]>(url).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:getPosts", url);
        throw error;
      })
    );
  }

  getOnePost(postId: string): Observable<Post> {
    const url = `${environment.apiUrl}/posts/${postId}?comments-limit=${GET_POST_COMMENTS_LIMIT}`;
    return this.http.get<Post>(url).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:getOnePost", url);
        throw error;
      })
    );
  }

  getComments(postId: string, before?: Date): Observable<Comment[]> {
    const url = `${environment.apiUrl}/posts/${postId}/comments?limit=${GET_COMMENTS_LIMIT}${before ? "&before=" + before : ""}`;
    return this.http.get<Comment[]>(url).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:getComments", url);
        throw error;
      })
    );
  }

  createPost(text: string): Observable<Post> {
    const url = `${environment.apiUrl}/posts`;
    return this.http.post<Post>(url, {text}).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:createPost", url);
        throw error;
      })
    );
  }

  createPostWithImage(data: FormData): Observable<Post> {
    const url = `${environment.apiUrl}/posts`;
    return this.http.post<Post>(url, data).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:createPostWithImage", url);
        throw error;
      })
    );
  }

  modifyPost(postId: string, text: string, removeImage?: boolean): Observable<Post> {
    const url = `${environment.apiUrl}/posts/${postId}`;
    return this.http.put<Post>(url, removeImage ? {text, removeImage} : {text}).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:modifyPost", url);
        throw error;
      })
    );
  }

  modifyPostWithImage(postId: string, data: FormData): Observable<Post> {
    const url = `${environment.apiUrl}/posts/${postId}`;
    return this.http.put<Post>(url, data).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:modifyPostWithImage", url);
        throw error;
      })
    );
  }

  deletePost(postId: string): Observable<void> {
    const url = `${environment.apiUrl}/posts/${postId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:deletePost", url);
        throw error;
      })
    );
  }

  addNewComment(text: string, postId: string): Observable<Comment> {
    const url = `${environment.apiUrl}/posts/${postId}/comments`;
    return this.http.post<Comment>(url, {text}).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:addNewComment", url);
        throw error;
      })
    );
  }

  likePost(postLiked: boolean, postId: string): Observable<Post> {
    const url = `${environment.apiUrl}/posts/${postId}/like`;
    return this.http.post<Post>(url, {like: Number(postLiked)}).pipe(
      catchError(error => {
        this.messagehandlingService.logError(error, "PostsService:likePost", url);
        throw error;
      })
    );
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