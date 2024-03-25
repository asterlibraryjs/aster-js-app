import { ServiceContract } from "@aster-js/ioc";
import { Route } from "./route";
import { SearchValues, RouteValues } from "./route-data";
import { IApplicationPart } from "../abstraction";
import { IRouteData } from "./iroute-data";
import { IContainerRouteData } from "./icontainer-route-data";
import { AppServiceId } from "../abstraction/app-service-id";

/**
 * Service id and store for route data and query data result of navigation for the part itself.
 *
 * To get current route data (route data registered by current app route declarations), use IContainerRouteData service.
 */
export const IPartRouteData = AppServiceId<IRouteData>("IPartRouteData");

@ServiceContract(IPartRouteData)
export class PartRouteData implements IRouteData {
    private readonly _parent: IRouteData | undefined;

    get path(): string { return this._parent?.path ?? ""; }

    get route(): Route { return this._parent?.route ?? Route.empty; }

    get values(): Readonly<RouteValues> { return this._parent?.values ?? {}; }

    get query(): Readonly<SearchValues> { return this._parent?.query ?? {}; }

    constructor(@IApplicationPart part: IApplicationPart) {
        this._parent = part.parent?.services.get(IContainerRouteData);
    }
}
