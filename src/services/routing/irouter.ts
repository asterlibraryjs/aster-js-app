import { IServiceProvider, ServiceIdentifier } from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { Route } from "./iroute-segment";

export const enum RouterActionResult {
    continue,
    stop
}


export const IRouter = ServiceIdentifier<IRouter>("IRouter");
export interface IRouter {
    eval(path: string): Promise<void> | false;
    createChild(services: IServiceProvider): IRouter;
}
