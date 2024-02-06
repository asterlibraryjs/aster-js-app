import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import { Route } from "./route";
import { QueryValues, RouteValues } from "./routing-invocation-context";
import { IApplicationPart } from "../abstraction";

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
    private _route: Route;
    private _values: Readonly<RouteValues>;
    private _query: Readonly<QueryValues>;
    private readonly _parent: IContainerRouteData | undefined;

    get route(): Route { return this._route }

    get values(): Readonly<RouteValues> { return this._values; }

    get query(): Readonly<QueryValues> { return this._query; }

    constructor(@IApplicationPart part: IApplicationPart) {
        this._parent = part.parent?.services.get(IContainerRouteData);
        if (this._parent) {
            this._route = this._parent.route;
            this._values = this._parent.values;
            this._query = this._parent.query;
        }
        else {
            this._route = Route.empty;
            this._values = Object.freeze({});
            this._query = Object.freeze({});
        }
    }

    getUrlSegment(): string {
        return this._route.resolve(this._values, false);
    }

    setState(route: Route, values: Readonly<RouteValues>, query: Readonly<QueryValues>): void {
        this._route = route;
        if (this._parent) {
            this._values = Object.freeze({ ...this._parent.values, ...values });
            this._query = Object.freeze({ ...this._parent.query, ...query });
        }
        else {
            this._values = Object.freeze(values);
            this._query = Object.freeze(query);
        }
    }
}
