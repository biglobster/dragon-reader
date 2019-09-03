import urlResolve from 'url-resolve-browser';
import {DisjointSet} from './algorithm';

// 为fetch添加超时功能, ref: http://imweb.io/topic/57c6ea35808fd2fb204eef63
function fetchWithTimeout(url: string, timeout: number): Promise<Blob> {
    return Promise.race([
        fetch(url).then(response => response.blob()),
        new Promise((resolve, reject) => setTimeout(() => reject('timeout ' + url), timeout))
    ]) as Promise<Blob>;
}

async function blobToText(blob: Blob, encoding: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = () => {
            reject('decode blob failure, encoding=' + encoding);
        };
        reader.readAsText(blob, encoding);
    });
}

async function fetchDOM(url: string, retry: number = 0): Promise<Document> {
    const blob = await fetchWithTimeout(url, 2000);
    const html1 = await blobToText(blob, 'utf-8');
    let dom = new DOMParser().parseFromString(html1, 'text/html');
    let charset = null;
    try {
        charset = dom.head.querySelector('[charset]').getAttribute('charset');
    } catch (e) {
    }
    if (!charset) {
        try {
            // <meta http-equiv="Content-Type" content="text/html; charset=gbk" />
            for (const m of nodeListToArray(dom.head.querySelectorAll('meta'))) {
                if (m.getAttribute('http-equiv') == 'Content-Type') {
                    const c = m.getAttribute('content');
                    const i = c.indexOf('charset=');
                    charset = c.slice(i + 8);
                }
            }
        } catch (e) {
        }
    }
    if (charset === 'utf-8' || !charset) {
        return dom;
    }
    const html2 = await blobToText(blob, charset);
    return new DOMParser().parseFromString(html2, 'text/html');
}

function nodeListToArray<E extends Node>(list: NodeListOf<E>): Array<E> {
    const result = [];
    for (let i = 0; i < list.length; i++)
        result.push(list.item(i));
    return result;
}

interface SearchEngineConfig {
    name: string,
    searchUrl: string,
    parseRule: string,
}

const baidu: SearchEngineConfig = {
    name: '百度搜索',
    searchUrl: 'https://www.baidu.com/s?wd=',
    parseRule: '.result h3 a'
};

const sogou: SearchEngineConfig = {
    name: '搜狗搜索',
    searchUrl: 'https://sogou.com/web?query=',
    parseRule: '.vrwrap .vrTitle a'
};

const qihu: SearchEngineConfig = {
    name: '360搜索',
    searchUrl: 'https://www.so.com/s?q=',
    parseRule: '.res-list h3 a'
};

const bing: SearchEngineConfig = {
    name: '必应搜索',
    searchUrl: 'https://cn.bing.com/search?q=',
    parseRule: '.b_algo h2 a'
};

async function searchOnSearchEngine(keyword: string, config: SearchEngineConfig): Promise<[string, string][]> {
    const dom = await fetchDOM(config.searchUrl + keyword);
    return nodeListToArray(dom.querySelectorAll(config.parseRule))
        .map(a => ([a.textContent, a.getAttribute('href')]));
}

function filterRepeatSite(input: [string, string][]): [string, string][] {
    const set = new Set();
    const output = [];
    for (const x of input) {
        const origin = new URL(x[1]).origin;
        if (set.has(origin))
            continue;
        set.add(origin);
        output.push(x);
    }
    return output;
}

interface Book {
    title: string;
    author: string;
    latency: number;
}

interface Chapter {
    title: string;
    url: string;
}

async function urlToBook(url: string): Promise<[Book, Chapter[]]> {
    const t0 = Date.now();
    const dom = await fetchDOM(url);
    const t1 = Date.now();

    const list = [];
    const domMeta = new Map<string, string>();
    for (const meta of nodeListToArray(dom.head.querySelectorAll('meta'))) {
        const key = meta.getAttribute('property');
        const value = meta.getAttribute('content');
        if (key) {
            domMeta.set(key, value);
        }
    }

    function containsDigital(str: string): boolean {
        const reg = /[0-9零一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]/;
        return reg.test(str);
    }

    function dfs(current: HTMLElement) {
        const isA = current.tagName === 'A';
        let count = 0;
        if (isA) {
            const digital = containsDigital(current.textContent);
            if (digital)
                count = 1;
            else
                count = 0.1
        }
        for (const element of nodeListToArray(current.childNodes)) {
            count += dfs(element as HTMLElement);
        }
        list.push({element: current, count});
        return count;
    }

    dfs(dom.body);

    list.sort((a, b) => a.count - b.count);
    let {element, count} = list[0];
    for (const item of list) {
        if (item.count > count * 1.3) {
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
    return [{
        title: domMeta.get('og:novel:book_name'),
        author: domMeta.get('og:novel:author'),
        latency: t1 - t0
    }, chapters];
}

function deltaScore(str1, str2) {
    const map = new Map<string, number>();
    for (const c of str1) {
        if (!map.has(c))
            map.set(c, 0);
        map.set(c, map.get(c) + 1);
    }
    let delta = 0;
    for (const c of str2) {
        if (!map.has(c) || map.get(c) == 0) {
            delta++;
        } else
            map.set(c, map.get(c) - 1);
    }

    for (const c of map.keys()) {
        delta += map.get(c);
    }

    return delta / Math.max(str1.length, str2.length);
}

function selectBestResults(results: [Book, Chapter[]][]): [Book, Chapter[]][] {
    results = results.filter(result => result[1].length);
    if (results.length === 0) {
        return [];
    }
    const set = new DisjointSet(results.map(result => result[1].length));
    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            const x = results[i];
            const y = results[j];
            const strX = x[1].map(item => item.title).join();
            const strY = y[1].map(item => item.title).join();
            const score = deltaScore(strX, strY);
            if (score > 0.5) {
                continue;
            }
            const delta = Math.abs(x[1].length - y[1].length);
            const max = Math.max(x[1].length, y[1].length);
            if (delta / max < 0.2) {
                set.merge(x[1].length, y[1].length);
            }
        }
    }
    const groups = results.map(result => set.find(result[1].length));
    const countMap = new Map<number, number>();
    for (const group of groups) {
        if (countMap.has(group)) {
            countMap.set(group, countMap.get(group) + 1);
        } else {
            countMap.set(group, 1);
        }
    }
    let bestGroup = -1;
    for (const group of groups) {
        if (bestGroup === -1 || countMap.get(group) > countMap.get(bestGroup)) {
            bestGroup = group;
        }
    }
    const bestResults = [];
    for (const result of results) {
        if (set.find(result[1].length) === bestGroup) {
            bestResults.push(result);
        }
    }

    bestResults.sort((a, b) => a[0].latency - b[0].latency);

    return bestResults;
}

async function main() {
    let urls = [];
    for (const config of [sogou, qihu, bing]) {
        console.time(config.name);
        urls.push(...await searchOnSearchEngine('狂神 阅读', config));
        console.timeEnd(config.name);
    }
    console.log(urls);
    urls = filterRepeatSite(urls);
    console.log(urls);

    const tasks = [];
    for (const [title, url] of urls) {
        tasks.push(urlToBook(url).catch(e => null));
    }

    console.time('fetch');
    const results = (await Promise.all(tasks)).filter(x => x);
    console.timeEnd('fetch');

    console.log('pre', results.length);
    for (const result of results) {
        console.log(result);
    }

    const bestResults = selectBestResults(results);
    console.log('best', bestResults.length);
    for (const result of bestResults) {
        console.log(result);
    }
}

main().catch(e => console.warn(e));