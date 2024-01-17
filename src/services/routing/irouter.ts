import { IServiceProvider, ServiceIdentifier } from "@aster-js/ioc";
import { RouteValues } from "./routing-invocation-context";

export const enum RouterActionResult {
    continue,
    stop
}

export const IRouter = ServiceIdentifier<IRouter>("IRouter");

export interface IRouter {
    eval(path: string, defaults: RouteValues): Promise<void> | false;
    createChild(services: IServiceProvider): IRouter;
}
