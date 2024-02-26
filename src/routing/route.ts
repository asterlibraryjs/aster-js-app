import { IRouteSegment } from "./iroute-segment";
import { WildcardRouteSegment, RelativeRouteSegment } from "./route-segments";
import { RouteResolutionContext } from "./route-resolution-context";
import { RouteValues } from "./routing-invocation-context";
import { Path } from "./path";

/**
 * Represents a route.
 */
export class Route implements Iterable<IRouteSegment>{
    private readonly _segments: readonly IRouteSegment[];
    private readonly _wildcard?: true;
    private readonly _relative?: true;

    static readonly empty = new Route([]);

    get wildcard(): boolean { return this._wildcard ?? false; }

    get relative(): boolean { return this._relative ?? false; }

    constructor(segments: Iterable<IRouteSegment>) {
        const array = [...segments];
        if (array.length) {
            if (array[array.length - 1] === WildcardRouteSegment.instance) {
                array.pop();
                this._wildcard = true;
            }

            if (array.length && array[0] === RelativeRouteSegment.instance) {
                array.shift();
                this._relative = true;
            }
        }
        this._segments = array;
    }

    match(ctx: RouteResolutionContext): boolean {
        if (!this._wildcard && ctx.remaining > this._segments.length) return false;
        if (this._relative && !ctx.relative) return false;

        for (let idx = 0; idx < this._segments.length; idx++) {
            const value = ctx.getAt(idx);
            if (!this._segments[idx].match(value)) {
                return false;
            }
        }

        return true;
    }

    getRouteValues(ctx: RouteResolutionContext): [path: string, values: RouteValues] {
        const values: RouteValues = {};
        const path: string[] = [];
        for (let i = 0; i < this._segments.length; i++) {
            const consumedPath = this._segments[i].read(ctx, values);
            if (consumedPath) path.push(consumedPath);
        }
        return [Path.join(path), values];
    }

    resolve(values: RouteValues, consume?: boolean): string {
        const segments = this.resolveSegments(values, consume);
        return Path.join([...segments]);
    }

    private *resolveSegments(values: RouteValues, consume?: boolean): Iterable<string> {
        for (const segment of this._segments) {
            const resolved = segment.resolve(values, consume);
            if (resolved) yield resolved;
        }
    }

    *[Symbol.iterator](): IterableIterator<IRouteSegment> {
        yield* this._segments;
    }
}
