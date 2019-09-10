import {Component} from '@angular/core';
import {Book} from "../logic/define";
import {Spider} from "../logic/spider/spider";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'dragon-reader';

    lines: string[];
    book: Book;
    keyword: string;

    async search() {
        this.book = await new Spider().fetchBook(this.keyword);
    }

    async show(index) {
        this.lines = await new Spider().fetchContent(this.book.sources, 0, index);
    }
}
