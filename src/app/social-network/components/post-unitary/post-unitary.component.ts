import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { Post } from 'src/app/core/models/post.model';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-post-unitary',
  templateUrl: './post-unitary.component.html',
  styleUrls: ['./post-unitary.component.scss']
})
export class PostUnitaryComponent implements OnInit {
  post$!: Observable<Post>;

  constructor(private route: ActivatedRoute,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.post$ = this.route.data.pipe(
      map(data => ({canEditAndDelete: this.authService.canEditAndDeletePost(data['post'].authorId), ...data['post']}))
    );
  }

}
