import { resolveServiceId, ServiceIdentifier } from "@aster-js/ioc";
import { Constructor, Func, Tag } from "@aster-js/core";
import type { IRoutingResult } from "./irouting-result";
import { IRoutingHandler } from "../routing";
import { ControllerConfigTag } from "./controller-config-tag";
import { ControllerRoutingHandler } from "./controller-routing-handler";
import { ControllerRoutingResult } from "./controller-routing-result";

export type ControllerRoute = {
    readonly serviceId: ServiceIdentifier;
    readonly target: Constructor;
    readonly relativePath: string;
    readonly propertyKey: string;
    readonly callback: Func<any[], ControllerRoutingResult>;
}

export namespace ControllerRoute {

    const ControllerRoutingHandlerTag = Tag.lazy<ControllerRoute[]>("routes", () => []);

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
