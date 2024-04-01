import { AppServiceId } from "../abstraction/app-service-id";
import { IRoutingHandler } from "./irouting-handler";
import { Route } from "./route";

export const IRoutingTable = AppServiceId("IRoutingTable");

export interface IRoutingTable {
    getPaths(): Iterable<string>;
    getHandlers(): Iterable<readonly [Route, IRoutingHandler]>;
}
