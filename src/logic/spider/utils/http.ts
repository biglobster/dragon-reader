import {nodeListToArray} from './dom';

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

export async function fetchDOM(url: string, retry: number = 0): Promise<Document> {
    const blob = await fetchWithTimeout(url, 2000);
    const html1 = await blobToText(blob, 'utf-8');
    const dom = new DOMParser().parseFromString(html1, 'text/html');
    let charset = null;
    try {
        charset = dom.head.querySelector('[charset]').getAttribute('charset');
    } catch (e) {
    }
    if (!charset) {
        try {
            // <meta http-equiv="Content-Type" content="text/html; charset=gbk" />
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
