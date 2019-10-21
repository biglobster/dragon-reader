import {Book, Source} from '../define';
import {searchKeyword} from './components/search-engine';
import {selectBestGroup} from './components/group-books';
import {mergeBook} from './components/merge-books';
import {findChapters} from './components/find-chapter';
import {filterContent} from './components/content-filter';
import {extractBook} from './components/extract-book';
import {extractContent} from './components/extract-content';

export class SpiderA {
    static async fetchBook(keyword): Promise<Book> {
        const searchResults = await searchKeyword(keyword);
        const books: Book[] = await Promise.all(searchResults.map(searchResult => extractBook(searchResult.url).catch(() => null)));
        return await mergeBook(selectBestGroup(books.filter(x => x)));
    }

    static async fetchContent(sources: Source[], mainSourceIndex: number, mainChapterIndex: number): Promise<string[]> {
        const positions = findChapters(sources, mainSourceIndex, mainChapterIndex);
        const tasks = [];
        for (let i = 0; i < sources.length; i++) {
            if (positions[i] == null) {
                tasks.push(Promise.resolve(null));
            } else {
                tasks.push(extractContent(sources[i].chapters[positions[i]].url).catch(() => null));
            }
        }
        const contents = await Promise.all(tasks);
        let baseContent = contents[mainSourceIndex];
        for (let i = 0; i < sources.length; i++) {
            if (i === mainSourceIndex) {
                continue;
            }
            const refContent = contents[i];
            if (refContent == null || refContent.length === 0) {
                continue;
            }
            if (baseContent == null || baseContent.length === 0) {
                baseContent = refContent;
                continue;
            }
            baseContent = filterContent(baseContent, refContent);
        }
        return baseContent;
    }
}

