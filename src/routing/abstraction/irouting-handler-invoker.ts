import { AppServiceId } from "../../abstraction/app-service-id";

import { RouteResolutionCursor } from "../route-resolution-cusor";
import { RouteData } from "../route-data/route-data";
import { IRoutingHandler } from "./irouting-handler";

export const IRoutingHandlerInvoker = AppServiceId<IRoutingHandlerInvoker>("IRoutingHandlerInvoker");
export interface IRoutingHandlerInvoker {
    invoke(handler: IRoutingHandler, ctx: RouteResolutionCursor, routeData: RouteData): Promise<void>;
}
