import { Route } from "../route";
import { SearchValues, RouteValues } from "../route-data";

export interface IRouteData {
    /** Gets the evaluated path */
    readonly path: string;
    /** Gets the last evaluated route */
    readonly route: Route;
    /** Gets the last evaluated route values */
    readonly values: Readonly<RouteValues>;
    /** Gets the last evaluated query values */
    readonly query: Readonly<SearchValues>;
}
