import { Lookup } from "@aster-js/collections";
import { Constructor, Tag } from "@aster-js/core";
import { IRoutingHandler, RouteData } from "../routing";
import {IApplicationPart} from "../abstraction";

export const ControllerRoutingHandlerTag = Tag.lazy<Constructor<IRoutingHandler>[]>("routes", () => []);

export type ControllerArgAccessor = (data: RouteData, app: IApplicationPart) => any;

export type ControllerArg = {
    index: number;
    accessor: ControllerArgAccessor;
}

export const ControllerCallbackArgsTag = Tag.lazy<Lookup<string, ControllerArg>>("route args", () => new Lookup());
