import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Post } from 'src/app/core/models/post.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  canEditAndDelete!: boolean;

  constructor() {}

  ngOnInit(): void {}
  
  ngOnChanges(changes: SimpleChanges) {
    const newPost: Post = changes['post'].currentValue;
    if (newPost != null) {
      console.log(newPost);
      this.canEditAndDelete = true;
    }
  }
}
