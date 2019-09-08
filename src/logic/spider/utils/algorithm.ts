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

// 最长公共子序列
export function lcs(a: string, b: string): string {
    if (!a || !b) {
        return '';
    }
    const f: number[][] = [];
    const s: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
        f[i] = [];
        s[i] = [];
        for (let j = 0; j <= b.length; j++) {
            f[i].push(0);
            s[i].push(0);
        }
    }
    for (let i = 0; i <= a.length; i++) {
        for (let j = 0; j <= b.length; j++) {
            f[i][j] = 0;
            s[i][j] = -1;
            if (i > 0 && f[i - 1][j] >= f[i][j]) {
                f[i][j] = f[i - 1][j];
                s[i][j] = 0;
            }
            if (j > 0 && f[i][j - 1] >= f[i][j]) {
                f[i][j] = f[i][j - 1];
                s[i][j] = 1;
            }
            if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && f[i - 1][j - 1] + 1 >= f[i][j]) {
                f[i][j] = f[i - 1][j - 1] + 1;
                s[i][j] = 2;
            }
        }
    }

    let x = a.length;
    let y = b.length;
    let result = '';
    while (true) {
        if (s[x][y] === -1) {
            break;
        } else if (s[x][y] === 0) {
            x = x - 1;
        } else if (s[x][y] === 1) {
            y = y - 1;
        } else if (s[x][y] === 2) {
            result = a[x - 1] + result;
            x = x - 1;
            y = y - 1;
        }
    }
    return result;
}
