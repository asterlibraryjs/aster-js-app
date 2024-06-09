import { IRouteSegment } from "../abstraction/iroute-segment";
import { RouteValues } from "../route-data/route-values";

import { RouteResolutionCursor } from "../route-resolution-cusor";
import { RoutingConstants } from "../routing-constants";

export class RelativeRouteSegment implements IRouteSegment {

    static readonly instance = new RelativeRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionCursor, values: RouteValues): string | null {
        const current = ctx.peek();
        if (current !== RoutingConstants.RELATIVE_CHAR) {
            throw new Error(`Invalid token: expected segment to be a "~" symbol but current segment is equal to "${current}"`);
        }
        ctx.shift();
        return null;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return null;
    }

    toString(): string {
        return RoutingConstants.RELATIVE_CHAR;
    }

    static isRelative(segment: string): boolean {
        return segment === RoutingConstants.RELATIVE_CHAR;
    }
}
