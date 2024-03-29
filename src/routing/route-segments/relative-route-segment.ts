import { IRouteSegment } from "../iroute-segment";
import { RouteResolutionContext } from "../route-resolution-context";
import { RoutingConstants } from "../routing-constants";
import { RouteValues } from "../routing-invocation-context";

export class RelativeRouteSegment implements IRouteSegment {

    static readonly instance = new RelativeRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionContext, values: RouteValues): string | null {
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

    static isRelative(segment: string): boolean {
        return segment === RoutingConstants.RELATIVE_CHAR;
    }
}
