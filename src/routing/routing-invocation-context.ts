import { IApplicationPart } from "../abstraction";
import { Route } from "./route";

/** Values extracted from the url path by a matching route */
export type RouteValues = Record<string, string | number>;

/** Values extracted from the url search */
export type SearchValues = Record<string, string | string[]>;

/** Represents a merge of values comming from RouteValues and QueryValues where QueryValues can override RouteValues */
export type UrlValues = Record<string, string | string[] | number>;

export namespace SearchValues {
    /** Parse and map a query search into a QueryValues bag */
    export function parse(query: string): SearchValues {
        const result: SearchValues = {};

        const search = new URLSearchParams(query);
        for (const [key, value] of search) {
            if (Reflect.has(result, key)) {
                const current = result[key];
                if (Array.isArray(current)) {
                    current.push(value);
                }
                else {
                    result[key] = [current, value];
                }
            }
            else {
                result[key] = value;
            }
        }

        return result;
    }
}

export namespace UrlValues {
    /** Create a new ParamValues by merging RouteValues and QueryValues */
    export function create(values: RouteValues, query: SearchValues): SearchValues {
        return Object.assign({}, values, query);
    }
}

/** Represents all values extracted from the url */
export type RouteData = {
    readonly values: RouteValues;
    readonly query: SearchValues;
}

export type RoutingInvocationContext = {
    readonly route: Route;
    readonly data: RouteData;
    readonly app: IApplicationPart;
}
