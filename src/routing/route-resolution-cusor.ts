import { Path, PathParsingOptions } from "./path";

export class RouteResolutionCursor implements Iterable<string> {
    private readonly _segments: string[];
    private _next: number = 0;

    get remaining(): number { return this._segments.length - this._next; }

    get relative(): boolean { return this._relative; }

    get remainingPath(): string { return Path.join(this._segments.slice(this._next)); }

    get sourcePath(): string { return Path.join(this._segments); }

    constructor(
        segments: Iterable<string>,
        private readonly _relative: boolean
    ) {
        this._segments = [...segments];
    }

    peek(offset: number = 0): string | undefined {
        return this._segments[this._next + offset];
    }

    shift(): string | undefined {
        if (this._segments.length <= this._next) return;
        const result = this._segments[this._next];
        this._next++;
        return result;
    }

    *[Symbol.iterator](): IterableIterator<string> {
        yield* this._segments.slice(this._next);
    }

    toString(): string {
        return Path.join(this._segments.slice(this._next));
    }

    static read(url: string, options?: PathParsingOptions): RouteResolutionCursor {
        const path = Path.parse(url, options);
        return new RouteResolutionCursor(path, path.relative);
    }
}
