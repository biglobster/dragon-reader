import nzh from 'nzh';

export function normalizeChapter(title) {
    if (title) {
        return title
            .replace(/[ \t]/g, '')
            .replace(/[^0-9\u4e00-\u9fa5]/g, '')
            .replace(/[0-9]+/g, (word => nzh.cn.encodeS(Number(word))));
    }
    return 'Unknown';
}
