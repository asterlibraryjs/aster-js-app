import { ServiceIdentifier } from "@aster-js/ioc";
import { QueryValues, RouteValues } from "./routing-invocation-context";
import { IDisposable } from "@aster-js/core";
import { RouteResolutionContext } from "./route-resolution-context";

export const enum RouterActionResult {
    continue,
    stop
}

export const IRouter = ServiceIdentifier<IRouter>("IRouter");

export interface IRouter {
    eval(path: string, defaults?: RouteValues): Promise<void> | false;
    handle(ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<void> | false;
}
