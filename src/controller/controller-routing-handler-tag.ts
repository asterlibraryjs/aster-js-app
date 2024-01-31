import { Lookup } from "@aster-js/collections";
import { Constructor, Tag } from "@aster-js/core";
import { IRoutingHandler, RouteData } from "../routing";

export const ControllerRoutingHandlerTag = Tag.lazy<Constructor<IRoutingHandler>[]>("routes", () => []);

export type ControllerRouteArg = {
    index: number;
    accessor: (data: RouteData) => any;
}

export const ControllerRoutingCallbackArgsTag = Tag.lazy<Lookup<string, ControllerRouteArg>>("route args", () => new Lookup());
