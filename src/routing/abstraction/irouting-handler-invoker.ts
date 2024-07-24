import { AppServiceId } from "../../abstraction/app-service-id";

import { RouteResolutionCursor } from "../route-resolution-cusor";
import { RoutingInvocationContext } from "../routing-invocation-context";

export const IRoutingHandlerInvoker = AppServiceId<IRoutingHandlerInvoker>("IRoutingHandlerInvoker");
export interface IRoutingHandlerInvoker {
    invoke(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<boolean>;
}
