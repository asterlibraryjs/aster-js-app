import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import { Route } from "./route";
import { SearchValues, RouteValues } from "./routing-invocation-context";
import { IRouteData } from "./iroute-data";
import { IRouter } from "./irouter";
import { ApplicationPartLifecycleHooks } from "../application-part";

/**
 * Service id and contract to store route data and query data result of navigation of current route configuration.
 *
 * To get part route data (route data registered by part route declarations), use IPartRouteData service.
 */
export const IContainerRouteData = ServiceIdentifier<IRouteData>({ name: "@aster-js/app/IContainerRouteData", unique: true })

@ServiceContract(IContainerRouteData)
export class ContainerRouteData implements IRouteData {
    private _path: string;
    private _route: Route;
    private _values: Readonly<RouteValues>;
    private _query: Readonly<SearchValues>;

    get path(): string { return this._path; }

    get route(): Route { return this._route; }

    get values(): Readonly<RouteValues> { return this._values; }

    get query(): Readonly<SearchValues> { return this._query; }

    constructor(@IRouter private readonly _router: IRouter) {
        this._path = "";
        this._route = Route.empty;
        this._values = Object.freeze({});
        this._query = Object.freeze({});
    }

    [ApplicationPartLifecycleHooks.setup](): void {
        this._router.onDidEvaluate(this.setState, this);
    }

    private setState(path: string, route: Route, values: Readonly<RouteValues>, query: Readonly<SearchValues>): void {
        this._path = path;
        this._route = route;
        this._values = Object.freeze(values);
        this._query = Object.freeze(query);
    }
}
