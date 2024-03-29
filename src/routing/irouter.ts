import { ServiceIdentifier } from "@aster-js/ioc";
import { IEvent } from "@aster-js/events";
import { SearchValues, RouteValues } from "./routing-invocation-context";
import { RouteResolutionContext } from "./route-resolution-context";
import { IRoutingHandler } from "./irouting-handler";
import { Route } from "./route";

/**
 * Service Id and implementation for the service in charge of handling the application routing
 */
export const IRouter = ServiceIdentifier<IRouter>({ name: "@aster-js/app/IRouter", unique: true });
export interface IRouter {

    readonly onDidEvaluate: IEvent<[string, Route, RouteValues, SearchValues]>;
    /**
     * Gets all routing handlers for current scope
     */
    getHandlers(): Iterable<[Route, IRoutingHandler]>;
    /**
     * Gets all child router extracted from application part children
     * @param nested Indicate whether or not it should return nested children or only direct children
     */
    getActiveChildren(nested: boolean): AsyncIterable<IRouter>;
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
    handle(ctx: RouteResolutionContext, values: RouteValues, query: SearchValues): Promise<boolean>;
}
