import { Constructor } from "@aster-js/core";
import { IServiceFactory, IServiceProvider, ServiceContract, ServiceFactory } from "@aster-js/ioc";

import { IApplicationPart } from "../abstraction/iapplication-part";

import { IRoutingObserver } from "./abstraction/irouting-observer";
import { SearchValues } from "./route-data/search-values";
import { RouteValues } from "./route-data/route-values";
import { RouteData } from "./route-data/route-data";

import { IContainerRouteData, IRoutingHandler } from "./abstraction";
import { Route } from "./route";

@ServiceContract(IContainerRouteData)
export class ContainerRouteData implements IContainerRouteData, IRoutingObserver {
    private _previous: RouteData;
    private _current: RouteData;

    get path(): string { return this._current.path; }

    get route(): Route { return this._current.route; }

    get values(): Readonly<RouteValues> { return this._current.values; }

    get query(): Readonly<SearchValues> { return this._current.query; }

    constructor() {
        this._previous = RouteData.empty;
        this._current = RouteData.empty;
    }

    onRoutingDidBegin(handler: IRoutingHandler, routeData: RouteData, application: IApplicationPart): Promise<void> {
        this._previous = this._current;
        this._current = routeData;
        return Promise.resolve();
    }

    onRoutingDidComplete(handler: IRoutingHandler, routeData: RouteData, application: IApplicationPart): Promise<void> {
        this._previous = RouteData.empty;
        return Promise.resolve();
    }

    onRoutingDidFail(handler: IRoutingHandler, routeData: RouteData, application: IApplicationPart): Promise<void> {
        this._current = this._previous;
        return Promise.resolve();
    }
}


@ServiceFactory(IRoutingObserver)
export class ContainerRouteDataRoutingObserverFactory implements IServiceFactory {

    static get targetType(): Constructor<IRoutingObserver> { return ContainerRouteData; }

    constructor(@IServiceProvider private readonly _serviceProvider: IServiceProvider) { }

    create(): IRoutingObserver {
        return <ContainerRouteData>this._serviceProvider.get(IContainerRouteData);
    }

}