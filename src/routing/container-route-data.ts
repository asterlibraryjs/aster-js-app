import { Constructor } from "@aster-js/core";
import { IServiceFactory, IServiceProvider, ServiceContract, ServiceFactory } from "@aster-js/ioc";

import { IRoutingObserver } from "./abstraction/irouting-observer";
import { SearchValues } from "./route-data/search-values";
import { RouteValues } from "./route-data/route-values";
import { RouteData } from "./route-data/route-data";

import { IContainerRouteData } from "./abstraction";
import { Route } from "./route";
import { RoutingInvocationContext } from "./routing-invocation-context";
import { IAmbientRouteValues, IAmbientRouteValuesObserver } from "./abstraction/iambient-route-values";

@ServiceContract(IContainerRouteData)
export class ContainerRouteData implements IContainerRouteData, IRoutingObserver, IAmbientRouteValuesObserver {
    private _previous: RouteData;
    private _current: RouteData;
    private _effective: RouteData;

    get path(): string { return this._current.path; }

    get route(): Route { return this._current.route; }

    get values(): Readonly<RouteValues> { return this._effective.values; }

    get query(): Readonly<SearchValues> { return this._effective.query; }

    constructor(@IAmbientRouteValues private readonly _ambientRouteValues: IAmbientRouteValues) {
        this._previous = RouteData.empty;
        this._current = RouteData.empty;
        this._effective = RouteData.empty;
    }

    onRoutingDidBegin({ data }: RoutingInvocationContext): Promise<void> {
        this._previous = this._current;
        this._current = data;
        this.updateEffectiveValues();
        return Promise.resolve();
    }

    onRoutingDidComplete(ctx: RoutingInvocationContext): Promise<void> {
        this._previous = RouteData.empty;
        return Promise.resolve();
    }

    onRoutingDidFail(ctx: RoutingInvocationContext): Promise<void> {
        this._current = this._previous;
        this.updateEffectiveValues();
        return Promise.resolve();
    }

    onDidAmbientValuesChange(): void {
        this.updateEffectiveValues();
    }

    private updateEffectiveValues(): void {
        this._effective = {
            ...this._current,
            query: { ...this._current.query, ...this._ambientRouteValues.values }
        };
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


@ServiceFactory(IAmbientRouteValuesObserver)
export class ContainerAmbientRouteValuesObserverFactory implements IServiceFactory {

    static get targetType(): Constructor<IAmbientRouteValuesObserver> { return ContainerRouteData; }

    constructor(@IServiceProvider private readonly _serviceProvider: IServiceProvider) { }

    create(): IAmbientRouteValuesObserver {
        return <ContainerRouteData>this._serviceProvider.get(IContainerRouteData);
    }
}
