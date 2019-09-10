import {Book} from '../../define';
import {DisjointSet} from '../utils/algorithm';

function maybeSimilar(str1: string, str2: string) {
    const map = new Map<string, number>();
    for (const c of str1) {
        if (!map.has(c)) {
            map.set(c, 0);
        }
        map.set(c, map.get(c) + 1);
    }
    let delta = 0;
    for (const c of str2) {
        if (!map.has(c) || map.get(c) === 0) {
            delta++;
        } else {
            map.set(c, map.get(c) - 1);
        }
    }

    for (const c of map.keys()) {
        delta += map.get(c);
    }
    return delta / Math.max(str1.length, str2.length) < 0.4;
}

export function groupBooks(books: Book[]): Array<Book[]> {
    const p: number[] = [];
    for (let i = 0; i < books.length; i++) {
        p.push(i);
    }
    const set = new DisjointSet(p);
    for (let i = 0; i < books.length; i++) {
        for (let j = i + 1; j < books.length; j++) {
            const x = books[i];
            const y = books[j];
            const delta = Math.abs(x.sources[0].chapters.length - y.sources[0].chapters.length);
            const max = Math.max(x.sources[0].chapters.length, y.sources[0].chapters.length);
            if (delta / max > 0.2) {
                continue;
            }
            const strX = x.sources[0].chapters.map(item => item.title).join();
            const strY = y.sources[0].chapters.map(item => item.title).join();
            if (!maybeSimilar(strX, strY)) {
                continue;
            }
            set.merge(i, j);
        }
    }

    const map = new Map<number, Book[]>();
    for (let i = 0; i < books.length; i++) {
        const group = set.find(i);
        const book = books[i];
        if (!map.has(group)) {
            map.set(group, []);
        }
        map.get(group).push(book);
    }
    const result = [];
    for (const groupedBooks of map.values()) {
        result.push(groupedBooks);
    }
    return result;
}

export function selectBestGroup(books: Book[]): Book[] {
    const bookGroups = groupBooks(books);
    let bestGroup = null;
    for (const bookGroup of bookGroups) {
        if (bestGroup == null || bestGroup.length < bookGroup.length) {
            bestGroup = bookGroup;
        }
    }
    return bestGroup;
}
