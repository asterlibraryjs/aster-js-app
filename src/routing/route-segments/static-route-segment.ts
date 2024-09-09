import { IRouteSegment } from "../abstraction/iroute-segment";
import { RouteResolutionCursor } from "../route-resolution-cusor";
import { RouteValues } from "../route-data/route-values";


export class StaticRouteSegment implements IRouteSegment {

    get segment(): string { return this._segment; }

    constructor(
        private readonly _segment: string
    ) { }

    match(segment: string | undefined): boolean {
        return segment === this._segment;
    }

    read(ctx: RouteResolutionCursor, values: RouteValues): void {
        const current = ctx.peek();
        if (current !== this._segment) {
            throw new Error(`Invalid token: expected segment equals to "${this._segment}" but current segment is equal to "${current}"`);
        }
        ctx.shift();
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return this._segment;
    }

    toString(): string {
        return this._segment;
    }
}
