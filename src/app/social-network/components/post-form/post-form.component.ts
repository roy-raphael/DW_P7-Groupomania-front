import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MonoTypeOperatorFunction } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { Post } from 'src/app/core/models/post.model';
import { PostsService } from 'src/app/core/services/posts.service';
import { requiredFileType } from '../../validators/required-file-type.validator';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;
  @Output() newPost = new EventEmitter<Post>();
  private _file: File | null = null;
  loadingPost: boolean = false;
  loading: boolean = false;
  isAddMode!: boolean;
  error: string | null = null;

  mainForm!: FormGroup;
  textCtrl!: FormControl;
  imageCtrl!: FormControl;
  imageAltCtrl!: FormControl;

  originalPostId!: string | undefined;
  originalPostText!: string | undefined;
  originalPostImageUrl!: string | undefined;
  originalPostImageName!: string | undefined;
  originalPostImageAlt!: string | undefined;
  originalPostImageDeleted: boolean = false;

  constructor(private postsService: PostsService,
              private router: Router,
              private _ngZone: NgZone,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.originalPostId = this.route.snapshot.params['id'];
    this.isAddMode = !this.originalPostId;
    if (this.isAddMode) {
      this.initFormControls();
      this.initMainForm();
    } else {
      this.loadingPost = true;
      this.postsService.getOnePost(<string>this.originalPostId).pipe(
        take(1),
        tap((post: Post) => {
          this.originalPostText = post.text;
          this.originalPostImageUrl = post.imageUrl;
          this.originalPostImageName = post.imageUrl ? post.imageUrl.split('/').pop() : "";
          this.originalPostImageAlt = post.imageAlt;
          this.initFormControls();
          this.textCtrl.setValue(this.originalPostText);
          this.initMainForm();
          this.loadingPost = false;
        }),
        catchError(error => {
          this.loadingPost = false;
          this.displayError(error);
          throw error;
        })
      ).subscribe();
    }
  }

  get file(): File | null {
    return this._file;
  }

  private setFile(file: File | null): void {
    this._file = file;
    this.imageAltCtrl.reset();
    this.setImageAltValidators(file != null);
  }

  private initMainForm(): void {
    this.mainForm = this.formBuilder.group({
      text: this.textCtrl,
      image: this.imageCtrl,
      imageAlt: this.imageAltCtrl
    });
  }

  private initFormControls(): void {
    this.textCtrl = this.formBuilder.control('');
    this.imageCtrl = this.formBuilder.control(null, [requiredFileType(['jpg', 'jpeg', 'heic', 'png'])]);
    this.imageAltCtrl = this.formBuilder.control('');
  }

  private setImageAltValidators(imageAttached: boolean): void {
    if (imageAttached) {
      this.imageAltCtrl.addValidators([Validators.required]);
    } else {
      this.imageAltCtrl.clearValidators();
    }
    this.imageAltCtrl.updateValueAndValidity();
  }

  triggerResize(): void {
    // Wait for changes to be applied, then trigger textarea resize
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  handleFileInputEventTarget(eventTarget: EventTarget | null): void {
    if (eventTarget && eventTarget instanceof HTMLInputElement) {
      const files: (FileList | null) = eventTarget.files;
      if (files && files.length > 0) {
        if (this.imageCtrl.valid) {
          this.setFile(files.item(0));
        } else {
          this.imageCtrl.reset();
          console.log("Image control is invalid (during handleFileInputEventTarget) ; reseting it");
        }
      } else {
        console.error("handleFileInputEventTarget error : no file inside event");
      }
    } else {
      console.error("handleFileInputEventTarget error : no HTMLInputElement inside EventTarget (or EventTarget is null)");
    }
  }

  removeFile(): void {
    this.setFile(null);
    this.imageCtrl.patchValue(this._file);
    if (!this.isAddMode && this.originalPostImageUrl !== undefined) {
      this.originalPostImageUrl = undefined;
      this.originalPostImageName = undefined;
      this.originalPostImageAlt = undefined;
      this.originalPostImageDeleted = true;
    }
  }

  onSubmitForm(): void {
    if (this.mainForm.invalid || !this.textCtrl.value) {
      console.error("Error when new post submit button clicked : form is invalid");
      return;
    }

    if (!this.isAddMode && !this.originalPostId) {
      console.error("Error when new post submit button clicked : no post ID for a post edit");
      return;
    }

    // Disable the form and display the loading spinner
    this.loading = true;
    this.mainForm.disable();

    if (this._file) {
      const formData = new FormData();
      formData.append("post", JSON.stringify({text: this.textCtrl.value, imageAlt: "imageAlt"}));
      formData.append("image", this._file);
      if (this.isAddMode) {
        this.postsService.createPostWithImage(formData).pipe(
          this.processNewPost(),
          catchError(error => {
            this.processError(error);
            throw error;
          })
        ).subscribe();
      } else {
        this.postsService.modifyPostWithImage(this.originalPostId!, formData).pipe(
          this.processEditedPost(),
          catchError(error => {
            this.processError(error);
            throw error;
          })
        ).subscribe();
      }
    } else {
      if (this.isAddMode) {
        this.postsService.createPost(this.textCtrl.value).pipe(
          this.processNewPost(),
          catchError(error => {
            this.processError(error);
            throw error;
          })
        ).subscribe();
      } else {
        this.postsService.modifyPost(this.originalPostId!, this.textCtrl.value, this.originalPostImageDeleted).pipe(
          this.processEditedPost(),
          catchError(error => {
            this.processError(error);
            throw error;
          })
        ).subscribe();
      }
    }
  }

  processNewPost(): MonoTypeOperatorFunction<Post> {
    return tap((post: Post) => {
      this.loading = false;
      this.mainForm.enable();
      this.mainForm.reset();
      this.setFile(null);
      this.newPost.emit(post);
    });
  }

  processEditedPost(): MonoTypeOperatorFunction<Post> {
    return tap((post: Post) => {
      this.router.navigate(['..'], { relativeTo: this.route });
    });
  }

  processError(error: any): void {
    this.loading = false;
    this.mainForm.enable();
    this.displayError(error);
  }
  
  displayError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        this.error = "Erreur dans la requête HTTP envoyée";
      } else {
        this.error = "Erreur du serveur";
      }
    } else {
      this.error = "Erreur interne";
    }
  }
}
