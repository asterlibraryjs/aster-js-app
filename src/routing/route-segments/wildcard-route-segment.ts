import { IRouteSegment } from "../iroute-segment";
import { RouteResolutionContext } from "../route-resolution-context";
import { RouteValues } from "../routing-invocation-context";

const WILDCARD_CHAR = "*";

export class WildcardRouteSegment implements IRouteSegment {
    static readonly instance = new WildcardRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionContext, values: RouteValues): string | null {
        const current = ctx.peek();
        if (current !== WILDCARD_CHAR) {
            throw new Error(`Invalid token: expected segment to be a wildcard symbol but current segment is equal to "${current}"`);
        }
        ctx.shift();
        return null;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return null;
    }

    static isWildcard(segment: string): boolean {
        return segment === WILDCARD_CHAR;
    }
}
