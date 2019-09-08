// 将txt拆分为章节标题及内容行。
// 如果可以找到规律，则按规律拆，如果不行，就按100行拆
export async function splitTxt(txt: string): Promise<[string, string[]][]> {
    const lines = txt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);
    const regex = /(^第.{1,10}章.{1,20}$)|(^第.{1,10}节.{1,20}$)|(^第.{1,10}回.{1,20}$)/;

    let chapters: [string, string[]][] = [];

    let currentChapter: [string, string[]] = null;
    for (const line of lines) {
        if (regex.test(line)) {
            currentChapter = [line, []];
            chapters.push(currentChapter);
        } else {
            if (currentChapter === null) {
                currentChapter = ['未知', []];
                chapters.push(currentChapter);
            }
            currentChapter[1].push(line);
        }
    }

    if (chapters.length >= 10) {
        return chapters;
    }

    let id = 0;
    chapters = [];
    for (let i = 0; i < lines.length; i++) {
        if (i % 100 === 0) {
            currentChapter = ['自动拆分-' + (++id), []];
            chapters.push(currentChapter);
        }
        currentChapter[1].push(lines[i]);
    }
    return chapters;
}
