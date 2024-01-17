import { ServiceIdentifier } from "@aster-js/ioc";
import { Route } from "./route";
import { RouteData, RoutingInvocationContext } from "./routing-invocation-context";
import { IApplicationPart } from "../abstraction";

export type RouterAction = (ctx: RoutingInvocationContext) => Promise<void> | void;

export const IRoutingHandler = ServiceIdentifier<IRoutingHandler>("IRoutingHandler");
export interface IRoutingHandler {
    readonly route: Route;
    handle(data: RouteData, app: IApplicationPart): Promise<void>;
}
