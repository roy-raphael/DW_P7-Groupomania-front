import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Post } from 'src/app/core/models/post.model';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  canEditAndDelete!: boolean;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
  
  ngOnChanges(changes: SimpleChanges) {
    const newPost: Post = changes['post'].currentValue;
    if (newPost != null) {
      // console.log(newPost);
      this.canEditAndDelete = this.authService.isUserAdmin() || this.authService.isUserAuthor(newPost.authorId);
    }
  }
}
