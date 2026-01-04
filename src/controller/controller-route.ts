import { resolveServiceId, ServiceIdentifier } from "@aster-js/ioc";
import { Constructor, Func, Tag } from "@aster-js/core";
import type { IRoutingResult } from "./irouting-result";
import { IRoutingHandler } from "../routing";
import { ControllerConfigTag } from "./controller-config-tag";
import { ControllerRoutingHandler } from "./controller-routing-handler";
import { ControllerRoutingResult } from "./controller-routing-result";

/**
 * Represents the definition of a route bound to a controller method.
 */
export type ControllerRoute = {
    /** Controller service id */
    readonly serviceId: ServiceIdentifier;
    /** The targeted controller constructor */
    readonly target: Constructor;
    /** The relative path that represents the route */
    readonly relativePath: string;
    /** Property key to access the method */
    readonly propertyKey: string;
    /** Method function called during the route invocation */
    readonly callback: Func<any[], ControllerRoutingResult>;
}

export namespace ControllerRoute {

    const ControllerRoutingHandlerTag = Tag.lazy<ControllerRoute[]>("routes", () => []);

    /** Register a route for the provided controller constructor */
    export function add(
        relativePath: string,
        target: Constructor,
        propertyKey: string,
        callback: Func<any[], Promise<IRoutingResult> | IRoutingResult>
    ): void {
        const serviceId = resolveServiceId(target);

        ControllerRoutingHandlerTag.get(target)
            .push(
                { serviceId, relativePath, target, propertyKey, callback }
            );
    }

    /** Returns all routes registered for the provided controller constructor */
    export function *resolveRoutingHandlers(ctor: Constructor): Iterable<Constructor<IRoutingHandler>> {
        const routes = ControllerRoutingHandlerTag.get(ctor);
        for (const route of routes) {
            yield createHandler(route);
        }
    }

    function createHandler(route: ControllerRoute): Constructor<IRoutingHandler> {
        const controllerConfig = ControllerConfigTag(route.target);
        const path = controllerConfig?.baseRoute
            ? controllerConfig.baseRoute + route.relativePath
            : route.relativePath;

        return class RouteControllerRoutingHandler extends ControllerRoutingHandler {
            constructor() {
                super(path, route);
            }
        }
    }
}
