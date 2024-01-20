export class RouteResolutionContext implements Iterable<string>{
    private readonly _segments: string[];
    private readonly _initialSize: number;

    get remaining(): number { return this._segments.length; }

    get initialSize(): number { return this._initialSize; }

    constructor(segments: Iterable<string>) {
        this._segments = [...segments];
        this._initialSize = this._segments.length;
    }

    getAt(index: number): string | undefined {
        return this._segments[index];
    }

    peek(): string | undefined {
        return this._segments[0];
    }

    shift(): string | undefined {
        return this._segments.shift();
    }

    *[Symbol.iterator](): IterableIterator<string> {
        yield* this._segments;
    }
}