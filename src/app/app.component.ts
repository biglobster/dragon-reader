import {Component} from '@angular/core';
import {searchKeyword} from '../logic/spider/components/search-engine';
import {Book, SearchResult} from '../logic/define';
import {extractBook} from '../logic/spider/components/extract-book';
import {groupBooks, selectBestGroup} from '../logic/spider/components/group-books';
import {mergeBook} from '../logic/spider/components/merge-books';
import {SpiderA} from '../logic/spider/spider-a';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    step: number = 0;
    keyword: string = '大主宰';
    searchResults: SearchResult[];
    bookGroups: Array<Book[]>;
    bestGroup: Book[];
    book: Book;
    log: string;


    async search() {
        console.log('search', this.keyword);
        if (!this.keyword || !this.keyword.trim()) {
            return;
        }
        try {
            this.step = 1;
            this.searchResults = await searchKeyword(this.keyword);
            this.step = 2;
            const books: Book[] = await Promise.all(this.searchResults.map(searchResult => extractBook(searchResult.url).catch(() => null)));
            this.bookGroups = groupBooks(books.filter(book => book && book.sources));
            this.bestGroup = selectBestGroup(this.bookGroups);
            this.step = 3;
            this.book = await mergeBook(this.bestGroup);
            this.step = 4;
        } finally {

        }
    }

    async open(url: string) {
        (window as any).require('electron').shell.openExternal(url);
    }

    async download() {
        const content = [];
        const total = this.book.sources[0].chapters.length;
        let error = 0;
        let current = 0;
        for (let i = 0; i < total; i++) {
            try {
                const lines = await SpiderA.fetchContent(this.book.sources, 0, i);
                const title = this.book.sources[0].chapters[i].title;
                content.push(title, ...lines);
                this.log = `下载中：${++current} / ${total}`;
            } catch (e) {
                error++;
            }
        }
        const text = content.join('\n');
        (window as any).require('fs').writeFileSync(`${(window as any).require('os').homedir()}/Desktop/${this.book.title}.txt`, text);
        this.log = `下载完成，文件已保存到桌面`;
    }
}
