import type { IApplicationPart } from "../abstraction/iapplication-part";

import type { IRoutingHandler } from "./abstraction/irouting-handler";
import { RouteData } from "./route-data/route-data";

/** Contains informations about the invocation context of a route being handled by the router */
export type RoutingInvocationContext = {
    /** The handler that will handle the route */
    readonly handler: IRoutingHandler;
    /** The route data extracted from the url */
    readonly data: RouteData;
    /** The application part that handle the route */
    readonly app: IApplicationPart;
}
