import { IRouteSegment } from "../abstraction/iroute-segment";
import { RouteValues } from "../route-data/route-values";
import { RouteResolutionCursor } from "../route-resolution-cusor";

const WILDCARD_CHAR = "*";

export class WildcardRouteSegment implements IRouteSegment {
    static readonly instance = new WildcardRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return segment === WILDCARD_CHAR; }

    read(ctx: RouteResolutionCursor, values: RouteValues): void {
        const current = ctx.peek();
        if (current !== WILDCARD_CHAR) {
            throw new Error(`Invalid token: expected segment to be a wildcard symbol but current segment is equal to "${current}"`);
        }
        ctx.shift();
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return null;
    }

    toString(): string {
        return WILDCARD_CHAR;
    }

    static isWildcard(segment: string): boolean {
        return segment === WILDCARD_CHAR;
    }
}
