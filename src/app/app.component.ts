import {Component} from '@angular/core';
import {Book} from '../logic/define';
import {SpiderA} from '../logic/spider/spider-a';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    lines: string[];
    book: Book;
    keyword: string;

    async search() {
        this.book = await SpiderA.fetchBook(this.keyword);
    }

    async show(index) {
        this.lines = await SpiderA.fetchContent(this.book.sources, 0, index);
    }
}
