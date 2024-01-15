import { IApplicationPart } from "../abstraction";
import { Route } from "./iroute-segment";

export type RouteValues = Record<string, string | number>;

export type RoutingInvocationContext = {
    readonly route: Route;
    readonly values: RouteValues;
    readonly app: IApplicationPart;
}
