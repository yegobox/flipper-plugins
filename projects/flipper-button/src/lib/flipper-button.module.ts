import { NgModule } from '@angular/core';
import { FlipperButtonComponent } from './flipper-button.component';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule
  ],
  declarations: [FlipperButtonComponent],
  entryComponents: [],
  exports: [FlipperButtonComponent]
})
export class FlipperButtonModule { }
