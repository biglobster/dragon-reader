export function nodeListToArray<E extends Node>(list: NodeListOf<E>): Array<E> {
    const result = [];
    for (let i = 0; i < list.length; i++) {
        result.push(list.item(i));
    }
    return result;
}

export function queryOne(element: Element | Document, query: string): Element {
    return element.querySelector(query);
}

export function queryChild(element: Element | Document): Element[] {
    if (!element) {
        return [];
    }
    const result: Element[] = [];
    const elements = element.childNodes;
    for (let i = 0; i < elements.length; i++) {
        result.push(elements.item(i) as Element);
    }
    return result;
}

export function queryAll(element: Element | Document, query: string): Element[] {
    const result = [];
    const elements = element.querySelectorAll(query);
    for (let i = 0; i < elements.length; i++) {
        result.push(elements.item(i));
    }
    return result;
}

export function pureText(element: Element) {
    if (element && element.textContent) {
        if (element.nodeType === Node.COMMENT_NODE) {
            return null;
        }
        return element.textContent.trim();
    }
    return null;
}

export function pureAttr(element: Element, name: string) {
    if (element) {
        return element.getAttribute(name);
    }
    return null;
}

export function pureUrl(base: string, current: string): string {
    return new URL(current, base).href;
}

