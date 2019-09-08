import {lcs} from "../utils/algorithm";

export function filterContent(baseContent: string[], refContent: string[]): string[] {
    const refSet = new Set<String>();
    for (const line of refContent) {
        refSet.add(line);
    }

    const commonSet = new Set<String>();
    for (const line of baseContent) {
        if (refSet.has(line)) {
            commonSet.add(line);
        }
    }

    if (commonSet.size < baseContent.length * 0.5 || commonSet.size < refContent.length * 0.5) {
        return baseContent;
    }

    let baseStr = '';
    for (const line of baseContent) {
        if (!commonSet.has(line)) {
            baseStr += line + '#####';
        }
    }

    let refStr = '';
    for (const line of refContent) {
        if (!commonSet.has(line)) {
            refStr += line + '#####';
        }
    }

    if (baseStr.length * refStr.length > 500000) {
        return baseContent;
    }
    const commonStr = lcs(baseStr, refStr);
    let p = 0;
    let result = '';
    for (let line of baseContent) {
        if (commonSet.has(line)) {
            result += line + '#####';
        } else {
            line = line + '#####';
            let buf = '';
            for (const c of line) {
                if (p < commonStr.length && c === commonStr[p]) {
                    if (buf && buf.length < 5) {
                        result += buf;
                        buf = '';
                    }
                    result += c;
                    p++;
                } else {
                    buf += c;
                }
            }
        }
    }
    return result.split('#####').filter(line => line);
}
