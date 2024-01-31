import { IApplicationPart } from "../abstraction";
import { Route } from "./route";

/** Values extracted from the url path by a matching route */
export type RouteValues = Record<string, string | number>;

/** Values extracted from the url search */
export type QueryValues = Record<string, string | string[]>;

/** Represents a merge of values comming from RouteValues and QueryValues where QueryValues can override RouteValues */
export type ParamValues = Record<string, string | string[] | number>;

export namespace QueryValues {
    /** Parse and map a query search into a QueryValues bag */
    export function parse(query: string): QueryValues {
        const result: QueryValues = {};

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

export namespace ParamValues {
    /** Create a new ParamValues by merging RouteValues and QueryValues */
    export function create(values: RouteValues, query: QueryValues): QueryValues {
        return Object.assign({}, values, query);
    }
}

/** Represents all values extracted from the url */
export type RouteData = {
    readonly values: RouteValues;
    readonly query: QueryValues;
}

export type RoutingInvocationContext = {
    readonly route: Route;
    readonly data: RouteData;
    readonly app: IApplicationPart;
}
