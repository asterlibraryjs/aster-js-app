import { ServiceIdentifier } from "@aster-js/ioc";
import { QueryValues, RouteValues } from "./routing-invocation-context";
import { IDisposable } from "@aster-js/core";
import { RouteResolutionContext } from "./route-resolution-context";
import { IRoutingHandler } from "./irouting-handler";

export const enum RouterActionResult {
    continue,
    stop
}

export const IRouter = ServiceIdentifier<IRouter>("IRouter");

export interface IRouter {
    getHandlers(): Iterable<IRoutingHandler>;
    getChildren(nested: boolean): AsyncIterable<IRouter>;
    eval(path: string, defaults?: RouteValues): Promise<boolean>;
    handle(ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<boolean>;
}
