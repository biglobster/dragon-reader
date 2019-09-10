import uuid from 'uuid';
import {Book, BookInformation, Source} from '../../define';
import {normalizeChapter} from './chapter-normalize';
import {findChapters} from './find-chapter';
import {fetchContent} from './fetch-content';
import {DisjointSet} from '../utils/algorithm';

async function selectBestSources(sources: Source[]): Promise<Source[]> {

    const mainPositions = [
        Math.round(sources[0].chapters.length * 0.3),
        Math.round(sources[0].chapters.length * 0.6),
        Math.round(sources[0].chapters.length * 0.9)
    ];

    const qualities = sources.map(() => 0);
    for (const mainPosition of mainPositions) {
        const positions = findChapters(sources, 0, mainPosition);
        const tasks = [];
        for (let i = 0; i < sources.length; i++) {
            const chapter = sources[i].chapters[positions[i]];
            if (!chapter) {
                tasks.push([]);
            } else {
                tasks.push(fetchContent(chapter.url).catch(e => []));
            }
        }
        const contents = await Promise.all(tasks);
        const lens = contents.map(content => content.join().length);
        const avg = lens.reduce((x, y) => x + y, 0) / sources.length;
        const delta = lens.map(len => len - avg);
        delta.map((d, index) => qualities[index] += d);
    }

    const set = new DisjointSet(qualities);
    for (let i = 0; i < qualities.length; i++) {
        for (let j = i + 1; j < qualities.length; j++) {
            if (qualities[i] / qualities[j] < 1.1 && qualities[i] / qualities[j] > 0.9) {
                set.merge(qualities[i], qualities[j]);
            }
        }
    }

    const map = new Map();
    for (const quality of qualities) {
        const group = set.find(quality);
        if (!map.has(group)) {
            map.set(group, 0);
        }
        map.set(group, map.get(group) + 1);
    }
    let bestGroup = -1;
    for (const group of map.keys()) {
        if (bestGroup === -1 || map.get(group) > map.get(bestGroup)) {
            bestGroup = group;
        }
    }
    // for (let i = 0; i < qualities.length; i++) {
    //     if (set.find(qualities[i]) === bestGroup) {
    //         console.log('SUCC', sources[i]);
    //     } else {
    //         console.warn('FAIL', sources[i]);
    //     }
    // }
    return sources.filter((source, index) => set.find(qualities[index]) === bestGroup);
}

export async function mergeBook(books: Book[]): Promise<Book> {
    const information: BookInformation = {};
    for (const book of books) {
        for (const key in book.information) {
            if (book.information.hasOwnProperty(key)) {
                information[key] = information[key] || book.information[key];
            }
        }
    }
    let sources: Source[] = [];
    for (const book of books) {
        sources.push(...book.sources);
    }
    for (const source of sources) {
        for (const chapter of source.chapters) {
            chapter.normlizeTitle = normalizeChapter(chapter.title);
        }
    }
    sources = await selectBestSources(sources);
    sources.sort((a, b) => a.latency - b.latency);
    sources = sources.slice(0, 5);
    return {
        _id: uuid.v4(),
        title: information.title || '无标题',
        author: information.author || '佚名',
        information,
        sources
    };
}
