import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostFormRoutingModule } from './post-form-routing.module';
import { PostFormComponent } from './components/post-form/post-form.component';


@NgModule({
  declarations: [
    PostFormComponent
  ],
  imports: [
    CommonModule,
    PostFormRoutingModule
  ]
})
export class PostFormModule { }
