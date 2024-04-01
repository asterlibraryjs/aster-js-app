import { IEvent } from "@aster-js/events";

import { SearchValues, RouteValues } from "./route-data";
import { RouteResolutionCursor } from "./route-resolution-cusor";
import { IRoutingHandler } from "./irouting-handler";
import { Route } from "./route";
import { AppServiceId } from "../abstraction/app-service-id";

/**
 * Service Id and implementation for the service in charge of handling the application routing
 */
export const IRouter = AppServiceId<IRouter>("IRouter");
export interface IRouter {

    readonly onDidEvaluate: IEvent<[string, Route, RouteValues, SearchValues]>;
    /**
     * Evaluate provided path in current application
     * @param path Path to evaluate
     * @param defaults Default route values
     */
    eval(path: string, defaults?: RouteValues): Promise<boolean>;
    /**
     * Handle part of a path evaluation. Used internally to cascade path parts into child apps
     * @param ctx Context use to resolve routes
     * @param values Route values inherited
     * @param query Query values
     */
    handle(ctx: RouteResolutionCursor, values: RouteValues, query: SearchValues): Promise<boolean>;
}
