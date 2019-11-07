import {fetchDOM, nodeListToArray} from '../utils/dom';

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

function calculateCounts(current: ChildNode, depth: number): [number, number, number] {
    let [x, y, z] = [
        current && (current as HTMLElement).nodeValue && (current as HTMLElement).nodeValue.length || 0,
        current && (current as HTMLElement).nodeValue && chineseLength((current as HTMLElement).nodeValue) || 0,
        current && (current as HTMLElement).nodeValue && signLength((current as HTMLElement).nodeValue) || 0];
    for (const element of nodeListToArray(current.childNodes)) {
        const [x1, y1, z1] = calculateCounts(element, depth + 1);
        x += x1;
        y += y1;
        z += z1;
    }
    (current as any).myFlag = [x, y, z, depth];
    return [x, y, z];
}

function nodeToArray(current: ChildNode) {
    const array = [];
    if (['A', 'BUTTON', 'SCRIPT'].indexOf((current as any).tagName) !== -1) {
        return [];
    }
    for (const element of nodeListToArray(current.childNodes)) {
        array.push(...nodeToArray(element));
    }
    array.push(current);
    return array;
}

export async function extractContent(url: string): Promise<string[]> {
    const dom = await fetchDOM(url);
    const body = dom.body;
    calculateCounts(body, 0);
    const total = (body as any).myFlag[2];
    const nodes = nodeListToArray(body.querySelectorAll('*'));
    nodes.sort((a: any, b: any) => b.myFlag[3] - a.myFlag[3]);
    let bestNode = null;
    for (const node of nodes) {
        if ((node as any).myFlag[2] > total * 0.6) {
            bestNode = node;
            break;
        }
    }
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
