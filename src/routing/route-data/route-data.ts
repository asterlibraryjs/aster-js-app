import { Route } from "../route";
import { RouteValues } from "./route-values";
import { SearchValues } from "./search-values";

/** Represents all values extracted from the url */
export type RouteData = {
    readonly path: string;
    readonly route: Route;
    readonly values: RouteValues;
    readonly query: SearchValues;
}

export namespace RouteData {

    export const empty = Object.freeze<RouteData>({ path: "", route: Route.empty, values: {}, query: {} });

    export function create(route: Route, defaultRouteValues: RouteValues, routeValues: RouteValues, searchValues: SearchValues): RouteData {
        const mergedValues = { ...defaultRouteValues, ...routeValues };
        const path = route.resolve(mergedValues, false);
        return { path, route, values: mergedValues, query: searchValues };
    }

    export function merge(data: RouteData, values: RouteValues, search: SearchValues): RouteData {
        const mergedValues = { ...data.values, ...values };
        const mergedQuery = { ...data.query, ...search };
        return { path: data.path, route: data.route, values: mergedValues, query: mergedQuery };
    }
}
