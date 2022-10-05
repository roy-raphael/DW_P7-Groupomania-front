import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';



@NgModule({
  declarations: [
    TimeAgoPipe,
    ShortenPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MaterialModule,
    TimeAgoPipe,
    ShortenPipe
  ]
})
export class SharedModule { }
