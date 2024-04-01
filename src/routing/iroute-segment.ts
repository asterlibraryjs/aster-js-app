import { RouteResolutionCursor } from "./route-resolution-cusor";
import { RouteValues } from "./route-data";

export interface IRouteSegment {
    match(segment: string | undefined): boolean;
    read(ctx: RouteResolutionCursor, values: RouteValues): string | null;
    resolve(values: RouteValues, consume?: boolean): string | null;
}
