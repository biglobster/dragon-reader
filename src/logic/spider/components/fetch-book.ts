import uuid from 'uuid';
import urlResolve from 'url-resolve-browser';

import {Book, Chapter} from '../../define';
import {nodeListToArray} from '../utils/dom';
import {fetchDOM} from '../utils/http';

function parseBookInfo(dom: Document): Book {
    const domMeta = new Map<string, string>();
    for (const meta of nodeListToArray(dom.head.querySelectorAll('meta'))) {
        const key = meta.getAttribute('property');
        const value = meta.getAttribute('content');
        if (key) {
            domMeta.set(key, value);
        }
    }
    return {
        _id: uuid.v4(),
        title: null,
        author: null,
        information: {
            title: domMeta.get('og:novel:book_name'),
            author: domMeta.get('og:novel:author'),
            cover: domMeta.get('og:image'),
            category: domMeta.get('og:novel:category'),
            description: domMeta.get('og:description')
        }
    };
}

function dfs(current: HTMLElement, list) {
    const isA = current.tagName === 'A';
    let count = 0;
    if (isA) {
        const digital = containsDigital(current.textContent);
        if (digital) {
            count = 1;
        } else {
            count = 0.1;
        }
    }
    for (const element of nodeListToArray(current.childNodes)) {
        count += dfs(element as HTMLElement, list);
    }
    list.push({element: current, count});
    return count;
}

function containsDigital(str: string): boolean {
    const reg = /[0-9零一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]/;
    return reg.test(str);
}

function parseChapters(url: string, dom: Document): Chapter[] {
    const list = [];

    dfs(dom.body, list);

    list.sort((a, b) => a.count - b.count);
    let {element, count} = list[0];
    for (const item of list) {
        if (item.count > count * 1.5 && count < 200) {
            element = item.element;
        }
        count = item.count;
    }

    const set = new Set();
    const tempChapters = [];
    for (const a of element.querySelectorAll('a')) {
        if (a.text && a.getAttribute('href')) {
            tempChapters.push({title: a.text.trim(), url: urlResolve(url, a.getAttribute('href'))});
        }
    }
    tempChapters.reverse();
    const chapters = [];
    for (const chapter of tempChapters) {
        if (!set.has(chapter.url)) {
            set.add(chapter.url);
            chapters.push(chapter);
        }
    }
    chapters.reverse();
    return chapters;
}

export async function fetchBook(url): Promise<Book> {
    const t0 = Date.now();
    const dom = await fetchDOM(url);
    const t1 = Date.now();
    const book = parseBookInfo(dom);
    const chapters = parseChapters(url, dom);
    book.sources = [{url, chapters, latency: t1 - t0}];
    return book;
}
