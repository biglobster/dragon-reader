import {Book, Source} from "../define";
import {searchKeyword} from "./components/search-engine";
import {selectBestGroup} from "./components/group-books";
import {mergeBook} from "./components/merge-books";
import {findChapters} from "./components/find-chapter";
import {filterContent} from "./components/content-filter";
import {fetchContent} from "./components/fetch-content";
import {fetchBook} from "./components/fetch-book";

export class Spider {
    async fetchBook(keyword): Promise<Book> {
        let searchResults = await searchKeyword(keyword);
        let books: Book[] = await Promise.all(searchResults.map(searchResult => fetchBook(searchResult.url).catch(e => null)));
        console.log(books);
        books = selectBestGroup(books.filter(book => book));
        console.log(books);
        const book = await mergeBook(books);
        console.log(book);
        return book;
    }

    async fetchContent(sources: Source[], mainSourceIndex: number, mainChapterIndex: number): Promise<string[]> {
        const positions = findChapters(sources, mainSourceIndex, mainChapterIndex);
        const tasks = [];
        for (let i = 0; i < sources.length; i++) {
            if (positions[i] == null) {
                tasks.push(Promise.resolve(null));
            } else {
                tasks.push(fetchContent(sources[i].chapters[positions[i]].url).catch(() => null));
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

