import { ServiceContract } from "@aster-js/ioc";

import { IApplicationPart } from "../../abstraction/iapplication-part";

import { IRoutingHandler } from "../abstraction/irouting-handler";

import { RoutingInvocationContext } from "../routing-invocation-context";
import { RouteData } from "../route-data/route-data";

export type RouterAction = (ctx: RoutingInvocationContext) => Promise<void> | void;

@ServiceContract(IRoutingHandler)
export class ActionRoutingHandler implements IRoutingHandler {

    constructor(
        readonly path: string,
        private readonly _action: RouterAction
    ) { }

    handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const result = this._action({ data, app, handler: this });
        if (result instanceof Promise) return result;
        return Promise.resolve();
    }
}
