import {Source} from '../../define';

export function findChapters(sources: Source[], mainSourceIndex: number, mainChapterIndex: number): number[] {
    const baseSource = sources[mainSourceIndex];
    const baseChapter = baseSource.chapters[mainChapterIndex];
    const positions = [];
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        if (i === mainSourceIndex) {
            positions.push(mainChapterIndex);
            continue;
        }
        let position = null;
        for (let delta = 0; delta < 200; delta++) {
            if (position !== null) {
                break;
            }
            for (const dir of [-1, 1]) {
                const y1 = mainChapterIndex + delta * dir;
                if (y1 < 0 || y1 >= source.chapters.length) {
                    continue;
                }
                const refChapter = source.chapters[y1];
                if (baseChapter.normlizeTitle.indexOf(refChapter.normlizeTitle) !== -1
                    || refChapter.normlizeTitle.indexOf(baseChapter.normlizeTitle) !== -1) {
                    position = y1;
                }
            }
        }
        positions.push(position);
    }
    return positions;
}
