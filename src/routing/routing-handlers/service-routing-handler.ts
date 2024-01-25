import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import { Route } from "../route";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../routing-invocation-context";
import { IApplicationPart } from "../../abstraction";

export type ServiceRouterAction<T = any> = (service: T, data: RouteData) => Promise<void> | void;

@ServiceContract(IRoutingHandler)
export class ServiceRoutingHandler<T = any> implements IRoutingHandler {
    private readonly _route: Route;

    get path(): string { return this._path; }

    get route(): Route { return this._route; }

    constructor(private readonly _path: string,
        private readonly _serviceId: ServiceIdentifier,
        private readonly _action: ServiceRouterAction<T>) {
        this._route = Route.parse(_path);
    }

    handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const service = app.services.get(this._serviceId, true);
        const result = this._action(service, data);
        if (result instanceof Promise) return result;
        return Promise.resolve();
    }
}
