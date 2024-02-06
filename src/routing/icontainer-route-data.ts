import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import { Route } from "./route";
import { QueryValues, RouteValues } from "./routing-invocation-context";

/**
 * Service id and contract to store route data and query data result of navigation
 */
export const IContainerRouteData = ServiceIdentifier<IContainerRouteData>("IContainerRouteData")

export interface IContainerRouteData {
    /** Gets the last evaluated route */
    readonly route: Route;
    /** Gets the last evaluated route values */
    readonly values: Readonly<RouteValues>;
    /** Gets the last evaluated query values */
    readonly query: Readonly<QueryValues>;

    setState(route: Route, values: Readonly<RouteValues>, query: Readonly<QueryValues>): void;

    /** Returns current container url segment */
    getUrlSegment(): string;
}

@ServiceContract(IContainerRouteData)
export class ContainerRouteData implements IContainerRouteData {
    private _route: Route = Route.empty;
    private _values: Readonly<RouteValues> = Object.freeze({});
    private _query: Readonly<QueryValues> = Object.freeze({});

    get route(): Route { return this._route }

    get values(): Readonly<RouteValues> { return this._values; }

    get query(): Readonly<QueryValues> { return this._query; }

    getUrlSegment(): string {
        return this._route.resolve(this._values, false);
    }

    setState(route: Route, values: Readonly<RouteValues>, query: Readonly<QueryValues>): void {
        this._route = route;
        this._values = Object.freeze(values);
        this._query = Object.freeze(query);
    }
}
