import { ServiceContract } from "@aster-js/ioc";

import { IApplicationPart } from "../abstraction/iapplication-part";

import { IRouteData } from "./abstraction/iroute-data";
import { IContainerRouteData } from "./abstraction/icontainer-route-data";

import { SearchValues, RouteValues, IPartRouteData } from "./route-data";
import { Route } from "./route";

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