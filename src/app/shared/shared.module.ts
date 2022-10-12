import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';
import { UsernamePipe } from './pipes/username.pipe';



@NgModule({
  declarations: [
    TimeAgoPipe,
    ShortenPipe,
    UsernamePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MaterialModule,
    TimeAgoPipe,
    ShortenPipe,
    UsernamePipe
  ]
})
export class SharedModule { }
