import { RouteResolutionCursor } from "../route-resolution-cusor";
import { RouteValues } from "../route-data/route-values";

export interface IRouteSegment {
    match(segment: string | undefined): boolean;
    read(ctx: RouteResolutionCursor, values: RouteValues): void;
    resolve(values: RouteValues, consume?: boolean): string | null;
}
