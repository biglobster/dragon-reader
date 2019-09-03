// 并查集合
export class DisjointSet {
    private map: Map<number, number>;

    constructor(xs: number[]) {
        this.map = new Map();
        for (const x of xs) {
            this.map.set(x, x);
        }
    }

    find(x: number): number {
        if (this.map.get(x) === x) {
            return x;
        } else {
            this.map.set(x, this.find(this.map.get(x)));
            return this.map.get(x);
        }
    }

    merge(x: number, y: number) {
        this.map.set(this.find(x), this.find(y));
    }
}

