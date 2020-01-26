import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver'
import { DataService } from '../data/data.service';
import * as moment from 'moment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

    isDirty: boolean = false;

    private _filenamePrefix = "budget_mania_";

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.dataService.accountsChanged.subscribe(e => this.isDirty = true);
        this.dataService.categoriesChanged.subscribe(e => this.isDirty = true);
        this.dataService.transactionsChanged.subscribe(e => this.isDirty = true);

        this.isDirty = false;
    }

    onSave() {
        this.save(this.dataService.serialize());
    }

    loadFile(event: EventTarget) {
        let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
        let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
        let files: FileList = target.files;
        this.load(files[0]);
    }

    private save(data: string) {
        saveAs(new Blob([data], 
            { type: "text/plain;charset=utf-8" }),
            this._filenamePrefix + moment().format("YYYY-MM-DD-HH-mm-ss"));
        this.isDirty = false;
    }

    private load(file: File) {
        let fr: FileReader = new FileReader();
        fr.onload = (data) => {
            let jsonString = fr.result as string;
            this.dataService.setDataFromString(jsonString);
        }
        fr.readAsText(file, "utf-8");
    }
}
