import { Path } from "./path";

export class RouteResolutionContext implements Iterable<string>{
    private readonly _initialSize: number;

    get remaining(): number { return this._segments.length; }

    get initialSize(): number { return this._initialSize; }

    get relative(): boolean { return this._relative; }

    private constructor(
        private readonly _segments: string[],
        private _relative: boolean
    ) {
        this._initialSize = this._segments.length;
    }

    getAt(index: number): string | undefined {
        return this._segments[index];
    }

    peek(): string | undefined {
        return this._segments[0];
    }

    shift(): string | undefined {
        this._relative = true;

        if(this._segments.length === 0) return;
        return this._segments.shift();
    }

    *[Symbol.iterator](): IterableIterator<string> {
        yield* this._segments;
    }

    toString(): string {
        return Path.join(this._segments);
    }

    static parse(path: string, relative: boolean): RouteResolutionContext {
        const segments = path ? Path.split(path) : [];
        return new RouteResolutionContext(segments, relative);
    }

    static create(segments:Iterable<string>, relative: boolean): RouteResolutionContext {
        return new RouteResolutionContext([...segments], relative);
    }
}
