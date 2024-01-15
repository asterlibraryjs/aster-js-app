
export class RouteResolutionContext implements Iterable<string>{
    private readonly _segments: string[];
    private readonly _initialSize: number;

    get remaining(): number { return this._segments.length; }

    get initialSize(): number { return this._initialSize; }

    constructor(path: string) {
        this._segments = path.split("/").filter(Boolean);
        this._initialSize = this._segments.length;
    }

    getAt(index: number): string | undefined {
        return this._segments[index];
    }

    shift(): string | undefined {
        return this._segments.shift();
    }

    *[Symbol.iterator](): IterableIterator<string> {
        yield* this._segments;
    }
}
