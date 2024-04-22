import { Route } from "../route";
import { RouteValues } from "./route-values";
import { SearchValues } from "./search-values";

/** Represents all values extracted from the url */
export type RouteData = {
    readonly route: Route;
    readonly values: RouteValues;
    readonly query: SearchValues;
}

export namespace RouteData {
    export function create(route: Route, defaultRouteValues: RouteValues, routeValues: RouteValues, searchValues: SearchValues): RouteData {
        const mergedValues = {...defaultRouteValues, ...routeValues};
         return  { route, values: mergedValues, query: searchValues };
    }
}
