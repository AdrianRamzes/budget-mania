import { Component, OnInit } from '@angular/core';
import { ImportService } from '../import.service';

@Component({
  selector: 'app-select-file',
  templateUrl: './select-file.component.html'
})
export class SelectFileComponent implements OnInit {

  constructor(private importService: ImportService) { }

  ngOnInit() {
  }

  openFile(event: EventTarget) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    this.importService.tryParse(files[0])
  }
}
