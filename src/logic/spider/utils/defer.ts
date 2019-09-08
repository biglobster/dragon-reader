export class Defer<T> {
    protected _promise: Promise<T>;
    protected _resolve: any = null;
    protected _reject: any = null;

    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public resolve(value?: T): void {
        this._resolve(value);
    }

    public reject(err: any): void {
        this._reject(err);
    }

    get promise(): Promise<T> {
        return this._promise;
    }
}
