import {lcs} from '../utils/algorithm';

export function filterContent(baseContent: string[], refContent: string[]): string[] {
    if (baseContent == null || refContent == null || baseContent.length === 0 || refContent.length === 0) {
        return [];
    }
    const splitSign = '，';
    const baseSentence = baseContent.join('').split(splitSign);
    const refSentence = refContent.join('').split(splitSign);
    const baseSet = new Set<String>();
    const commonSet = new Set<String>();
    for (const sentence of baseSentence) {
        baseSet.add(sentence);
    }
    for (const sentence of refSentence) {
        if (baseSet.has(sentence)) {
            commonSet.add(sentence);
        }
    }
    const baseSentenceStr = baseSentence.filter(sentence => !commonSet.has(sentence)).join('');
    const refSentenceStr = refSentence.filter(sentence => !commonSet.has(sentence)).join('');

    if (baseSentenceStr.length * refSentenceStr.length > 4000000) {
        return baseContent;
    }
    const mergedSentenceStr = lcs(baseSentenceStr, refSentenceStr);
    let mergedContentStr = '';
    let p = 0;
    for (const sentence of baseSentence) {
        if (commonSet.has(sentence)) {
            mergedContentStr += sentence + '，';
        } else {
            for (let c of sentence) {
                if (mergedSentenceStr[p] === c) {
                    mergedContentStr += c;
                    p++;
                }
            }
            mergedContentStr += '，';
        }
    }
    const result = [];
    let p2 = 0;
    for (const line of baseContent) {
        let tempLine = '';
        let buf = '';
        for (let c of line) {
            if (mergedContentStr[p2] === c) {
                if (buf && buf.length < 5) {
                    tempLine += buf;
                    buf = '';
                }
                tempLine += c;
                p2++;
            } else {
                buf += c;
            }
        }
        if (tempLine)
            result.push(tempLine);
    }
    return result;
}