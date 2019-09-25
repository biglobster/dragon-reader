import {nodeListToArray, pureText} from '../utils/dom';
import {fetchDOM} from '../utils/http';

const reg = /[\u4e00-\u9fa5]/g;

function chineseLength(str) {
    if (!str) {
        return 0;
    }
    str = str.trim();
    const len1 = str.length;
    const len2 = str.replace(reg, '').length;
    return len1 - len2;
}

const reg2 = /[，。？！：、]/g;

function signLength(str) {
    if (!str) {
        return 0;
    }
    str = str.trim();
    const len1 = str.length;
    const len2 = str.replace(reg2, '').length;
    return len1 - len2;
}


//
//
// function dfs(current, list) {
//     let count = chineseLength(pureText(current));
//     if (count < 10) {
//         count *= 0.1;
//     }
//     for (const element of current.childNodes) {
//         count += dfs(element, list);
//     }
//     list.push({element: current, count});
//     return count;
// }
//
// function dfs2(current, lines) {
//     if (current.tagName == null) {
//         const line = pureText(current);
//         lines.push(line);
//     }
//     for (const element of current.childNodes) {
//         dfs2(element, lines);
//     }
// }

function tabs(depth: number) {
    let x = '';
    for (let i = 0; i < depth; i++) {
        x += '\t';
    }
    return x;
}

function calculateCounts(current: ChildNode, depth: number): [number, number, number] {
    let [x, y, z, d] = [
        current && (current as HTMLElement).nodeValue && (current as HTMLElement).nodeValue.length || 0,
        current && (current as HTMLElement).nodeValue && chineseLength((current as HTMLElement).nodeValue) || 0,
        current && (current as HTMLElement).nodeValue && signLength((current as HTMLElement).nodeValue) || 0,
        depth
    ];
    for (const element of nodeListToArray(current.childNodes)) {
        const [x1, y1, z1] = calculateCounts(element, depth + 1);
        x += x1;
        y += y1;
        z += z1;
    }
    (current as any).debug = [x, y, z, d];
    // if ((current as any).setAttribute)
    //     (current as any).setAttribute('ddd', JSON.stringify([x, y, z]));
    // if (x > 0)
    //     console.log(tabs(depth) + (current as any).tagName, [x, y, z]);
    return [x, y, z];
}

function nodeToArray(current: ChildNode) {
    const array = [];
    if (['A', 'BUTTON'].indexOf((current as any).tagName) !== -1) {
        return [];
    }
    for (const element of nodeListToArray(current.childNodes)) {
        array.push(...nodeToArray(element));
    }
    array.push(current);
    return array;
}

export async function fetchContent(url: string): Promise<string[]> {
    const dom = await fetchDOM(url);
    const body = dom.body;
    calculateCounts(body, 0);
    const total = (body as any).debug[2];
    const nodes = nodeListToArray(body.querySelectorAll("*"));
    nodes.sort((a: any, b: any) => b.debug[3] - a.debug[3]);
    // console.log(total);
    // console.log(nodes.map((node: any) => ([node.tagName, ...node.debug])));
    let bestNode = null;
    for (const node of nodes) {
        if ((node as any).debug[2] > total * 0.6) {
            bestNode = node;
            break;
        }
    }
    // console.log(bestNode);
    // console.log(nodeListToArray(bestNode.querySelectorAll("*")));

    const lines = [];
    let currentLine = '';

    const textNodes = nodeToArray(bestNode);
    for (const textNode of textNodes) {
        if (textNode.nodeName === '#text') {
            currentLine += textNode.nodeValue;
            // console.log(textNode.nodeValue);
        } else if (textNode.tagName === 'BR' || textNode.tagName === 'DIV' || textNode.tagName === 'P') {
            // console.log('->');
            lines.push(currentLine);
            currentLine = '';
        } else {
            // console.log(textNode.tagName)
        }
    }
    lines.push(currentLine);
    return lines.map(text => text && text.trim()).filter(text => text);
}
