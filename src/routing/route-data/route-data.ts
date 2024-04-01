import { RouteValues } from "./route-values";
import { SearchValues } from "./search-values";

/** Represents all values extracted from the url */
export type RouteData = {
    readonly values: RouteValues;
    readonly query: SearchValues;
}

export namespace RouteData {
    export function create(defaultRouteValues: RouteValues, routeValues: RouteValues, searchValues: SearchValues): RouteData {
        const mergedValues = {...defaultRouteValues, ...routeValues};
         return  { values: mergedValues, query: searchValues };
    }
}
