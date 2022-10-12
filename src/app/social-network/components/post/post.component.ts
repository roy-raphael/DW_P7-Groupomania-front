import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Post } from 'src/app/core/models/post.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { EllipsisDirective } from 'ngx-ellipsis';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @ViewChild(EllipsisDirective) ellipsisRef!: EllipsisDirective; // aim : tell the directive (from the template) to update
  @Input() post!: Post;
  canEditAndDelete: boolean = false;
  seeMoreButton: boolean = true;
  seeLessButton: boolean = false;
  hasBeenEdited: boolean = false;

  constructor(private authService: AuthService,
              private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {}
  
  ngOnChanges(changes: SimpleChanges) {
    const newPost: Post = changes['post'].currentValue;
    if (newPost != null) {
      // console.log(newPost);
      this.canEditAndDelete = this.authService.isUserAdmin() || this.authService.isUserAuthor(newPost.authorId);
      this.seeMoreButton = true;
      this.seeLessButton = false;
      this.hasBeenEdited = newPost.createdAt !== newPost.updatedAt;
    }
  }

  // Saves if the text has been truncated or not
  truncated(index: number) {
    this.seeMoreButton = index !== null;
  }

  // Shows the text completely
  showComplete() {
    if (this.ellipsisRef) {
      this.seeMoreButton = false;
      this.seeLessButton = true;
      this.changeDetectorRef.detectChanges();
      this.ellipsisRef.applyEllipsis();
    }
  }

  // Shows the text with an ellipsis (truncated)
  showTruncated() {
    if (this.ellipsisRef) {
      this.seeMoreButton = true;
      this.seeLessButton = false;
      this.changeDetectorRef.detectChanges();
      this.ellipsisRef.applyEllipsis();
    }
  }
}
