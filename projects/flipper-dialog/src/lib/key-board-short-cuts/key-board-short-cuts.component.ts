import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'lib-key-board-short-cuts',
  templateUrl: './key-board-short-cuts.component.html',
  styleUrls: ['./key-board-short-cuts.component.scss']
})
export class KeyBoardShortCutsComponent  {

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Esc') {
         this.dialogRef.close();
      }
    }
  constructor(public dialogRef: MatDialogRef<KeyBoardShortCutsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
}

}


