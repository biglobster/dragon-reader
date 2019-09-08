import {nodeListToArray, pureAttr, pureText} from "../utils/dom";
import {fetchDOM} from "../utils/http";
import {SearchResult} from "../../define";
import {invokeAll} from "../utils/invoke";

interface SearchEngineConfig {
    name: string;
    searchUrl: string;
    pageRule: string;
    pageScale: number;
    parseRule: string;
}

const sogou: SearchEngineConfig = {
    name: '搜狗搜索',
    searchUrl: 'https://sogou.com/web?query=',
    pageRule: '&page=',
    pageScale: 1,
    parseRule: '.vrwrap .vrTitle a',
};

const qihu: SearchEngineConfig = {
    name: '360搜索',
    searchUrl: 'https://www.so.com/s?q=',
    pageRule: '&pn=',
    pageScale: 1,
    parseRule: '.res-list h3 a'
};

const bing: SearchEngineConfig = {
    name: '必应搜索',
    searchUrl: 'https://cn.bing.com/search?q=',
    pageRule: '&first=',
    pageScale: 10,
    parseRule: '.b_algo h2 a'
};

async function searchOnSearchEngine(keyword: string, config: SearchEngineConfig, page: number): Promise<SearchResult[]> {
    const pageQuery = config.pageRule + Math.round((page - 1) * config.pageScale + 1);
    const dom = await fetchDOM(config.searchUrl + keyword + pageQuery);
    return nodeListToArray(dom.querySelectorAll(config.parseRule))
        .map(a => ({
            engine: config.name,
            title: pureText(a),
            url: pureAttr(a, 'href')
        }));
}

function filterRepeatSite(input: SearchResult[]): SearchResult[] {
    const set = new Set();
    const output = [];
    for (const x of input) {
        try {
            const origin = new URL(x.url).origin;
            if (set.has(origin))
                continue;
            set.add(origin);
            output.push(x);
        } catch (e) {

        }
    }
    return output;
}

export async function searchKeyword(keyword) {
    const tasks: [string, Promise<SearchResult[]>][] = [];
    for (const config of [sogou, qihu, bing]) {
        for (const page of [1, 2]) {
            tasks.push([config.name + page, searchOnSearchEngine(`${keyword} 阅读`, config, page)]);
        }
    }
    let results: SearchResult[] = [];
    const taskResults = await invokeAll(tasks);
    for (const taskResult of taskResults) {
        if (!taskResult[0]) {
            results.push(...taskResult[2])
        }
    }
    results = filterRepeatSite(results);
    return results;
}

