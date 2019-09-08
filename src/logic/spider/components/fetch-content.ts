import {pureText} from "../utils/dom";
import {fetchDOM} from "../utils/http";

const reg = /[\u4e00-\u9fa5]/g;

function chineseLength(str) {
    if (!str)
        return 0;
    str = str.trim();
    const len1 = str.length;
    const len2 = str.replace(reg, '').length;
    return len1 - len2;
}


function dfs(current, list) {
    let count = chineseLength(pureText(current));
    if (count < 10)
        count *= 0.1;
    for (const element of current.childNodes) {
        count += dfs(element, list);
    }
    list.push({element: current, count});
    return count;
}

function dfs2(current, lines) {
    if (current.tagName == null) {
        const line = pureText(current);
        lines.push(line);
    }
    for (const element of current.childNodes) {
        dfs2(element, lines);
    }
}

export async function fetchContent(url: string): Promise<string[]> {
    const dom = await fetchDOM(url);
    const list = [];
    dfs(dom, list);
    list.sort((a, b) => a.count - b.count);
    let {element, count} = list[0];
    for (const item of list) {
        if (item.count > count * 1.5 && count <= 1000) {
            element = item.element;
        }
        count = item.count;
    }
    let lines = [];
    dfs2(element, lines);
    return lines.map(text => text && text.trim()).filter(text => text);
}