import { ServiceIdentifier } from "@aster-js/ioc";

import { IRoutingHandler } from "./irouting-handler";
import { RouteResolutionCursor } from "./route-resolution-cusor";
import { RouteData } from "./route-data";

export const IRoutingHandlerInvoker = ServiceIdentifier<IRoutingHandlerInvoker>({ name: "IRoutingHandlerInvoker", namespace: "@aster-js/app", unique: true });
export interface IRoutingHandlerInvoker {
    invoke(handler: IRoutingHandler, ctx: RouteResolutionCursor, routeData: RouteData): Promise<void>;
}
