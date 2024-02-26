import { RouteResolutionContext } from "./route-resolution-context";
import { RouteValues } from "./routing-invocation-context";

export interface IRouteSegment {
    match(segment: string | undefined): boolean;
    read(ctx: RouteResolutionContext, values: RouteValues): string | null;
    resolve(values: RouteValues, consume?: boolean): string | null;
}
