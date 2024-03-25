import type { RouteValues } from "./route-values";
import type { SearchValues } from "./search-values";

/** Represents a merge of values comming from RouteValues and QueryValues where QueryValues can override RouteValues */
export type UrlValues = Record<string, string | string[] | number>;


export namespace UrlValues {
    /** Create a new ParamValues by merging RouteValues and QueryValues */
    export function create(values: RouteValues, query: SearchValues): SearchValues {
        return Object.assign({}, values, query);
    }
}
