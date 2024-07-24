import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

import { IRoutingHandler } from "../abstraction/irouting-handler";
import { RouteData } from "../route-data/route-data";
import { RoutingInvocationContext } from "../routing-invocation-context";

export type ServiceRouterAction<T = any> = (service: T, data: RouteData) => Promise<void> | void;

@ServiceContract(IRoutingHandler)
export class ServiceRoutingHandler<T = any> implements IRoutingHandler {
    constructor(
        readonly path: string,
        private readonly _serviceId: ServiceIdentifier,
        private readonly _action: ServiceRouterAction<T>
    ) { }

    handle({ data, app }: RoutingInvocationContext): Promise<void> {
        const service = app.services.get(this._serviceId, true);
        const result = this._action(service, data);
        if (result instanceof Promise) return result;
        return Promise.resolve();
    }
}
