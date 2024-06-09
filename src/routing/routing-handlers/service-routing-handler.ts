import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

import { IApplicationPart } from "../../abstraction/iapplication-part";

import { IRoutingHandler } from "../abstraction/irouting-handler";
import { RouteData } from "../route-data/route-data";

export type ServiceRouterAction<T = any> = (service: T, data: RouteData) => Promise<void> | void;

@ServiceContract(IRoutingHandler)
export class ServiceRoutingHandler<T = any> implements IRoutingHandler {
    constructor(
        readonly path: string,
        private readonly _serviceId: ServiceIdentifier,
        private readonly _action: ServiceRouterAction<T>
    ) { }

    handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const service = app.services.get(this._serviceId, true);
        const result = this._action(service, data);
        if (result instanceof Promise) return result;
        return Promise.resolve();
    }
}
