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
    log: string;

    async search() {
        this.log = '搜索中，大约需要10秒钟。。。';
        this.book = await SpiderA.fetchBook(this.keyword);
        this.log = '搜索完成';
    }

    async show(index) {
        this.lines = await SpiderA.fetchContent(this.book.sources, 0, index);
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
        this.log = `下载完成`;
    }
}
