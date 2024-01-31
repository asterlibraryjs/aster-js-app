import { IApplicationPart } from "../abstraction";
import { Route } from "./route";

export type RouteValues = Record<string, string | number>;

export type QueryValues = Record<string, string>;

export type RouteData = {
    readonly values: RouteValues;
    readonly query: QueryValues;
}

export type RoutingInvocationContext = {
    readonly route: Route;
    readonly data: RouteData;
    readonly app: IApplicationPart;
}
