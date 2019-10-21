export function nodeListToArray<E extends Node>(list: NodeListOf<E>): Array<E> {
    const result = [];
    for (let i = 0; i < list.length; i++) {
        result.push(list.item(i));
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

function fetchWithTimeout(url: string, timeout: number): Promise<Blob> {
    // TODO for cordova
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

export async function fetchDOM(url: string): Promise<Document> {
    const blob = await fetchWithTimeout(url, 3000);
    const html1 = await blobToText(blob, 'utf-8');
    const dom = new DOMParser().parseFromString(html1, 'text/html');
    let charset = null;
    try {
        charset = dom.head.querySelector('[charset]').getAttribute('charset');
    } catch (e) {
    }
    if (!charset) {
        try {
            for (const m of nodeListToArray(dom.head.querySelectorAll('meta'))) {
                if (m.getAttribute('http-equiv') === 'Content-Type') {
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
