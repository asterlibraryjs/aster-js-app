import { asserts, Constructor, Func } from "@aster-js/core";
import { resolveServiceId } from "@aster-js/ioc";
import { RouteData, UrlValues } from "../routing";
import { ControllerRoutingHandler } from "./controller-routing-handler";
import { ControllerCallbackArgsTag, ControllerRoutingHandlerTag } from "./controller-routing-handler-tag";
import { IApplicationPart } from "../abstraction";
import { IAmbientRouteValues } from "../routing/abstraction/iambient-route-values";

/** Decorate to enable binding route template to controller method call */
export const RoutePath = (path: string) => {
    return <MethodDecorator>function (target, propertyKey, descriptor) {
        asserts.ofType(propertyKey, "string");

        const callback = <any>descriptor.value;
        if (typeof callback !== "function") throw new Error();

        const serviceId = resolveServiceId(<Constructor>target.constructor);
        class RouteControllerRoutingHandler extends ControllerRoutingHandler {
            constructor() {
                super(path, <string>propertyKey, serviceId, callback);
            }
        }
        ControllerRoutingHandlerTag.get(target).push(RouteControllerRoutingHandler);
    }
}


/** Decorate parameters of controller route calls to inject any values from the route
 * @param name Name of the parameter to reteive and inject the value. If not provided, the value injected the entire RouteValues bag
 */
export const FromRoute = (name?: string) => {
    return <ParameterDecorator>function (target: object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        const accessor = ({ values }: RouteData) => name ? values[name] : structuredClone(values);

        injectArgument(target, propertyKey, index, accessor);
    }
}

/** Decorate parameters of controller route calls to inject any values from the query
 * @param name Name of the parameter to reteive and inject the value. If not provided, the value injected the entire QueryValues bag
 */
export const FromSearch = (name?: string) => {
    return <ParameterDecorator>function (target: object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        function accessor({ query }: RouteData, app: IApplicationPart) {
            if(name) return query[name];

            const result = structuredClone(query);
            const ambientValues = app.services.get(IAmbientRouteValues, true).values;

            return Object.assign(result, ambientValues);
        }
        injectArgument(target, propertyKey, index, accessor);
    }
}

/**
 * Decorate parameters of controller route calls to inject any values from the route or the query
 * @param name Name of the parameter to reteive and inject the value. If not provided, the value injected the entire ParamValues bag
 */
export const FromUrl = (name?: string) => {
    return <ParameterDecorator>function (target: object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        const accessor = ({ values, query }: RouteData, app: IApplicationPart) => {
            const ambientValues = app.services.get(IAmbientRouteValues, true);

            if (!name) return UrlValues.create(values, query, ambientValues.values);

            if (Reflect.has(ambientValues.values, name)) return ambientValues.values[name];

            if (Reflect.has(query, name)) return query[name];

            return values[name];
        };

        injectArgument(target, propertyKey, index, accessor);
    }
}

export function injectArgument(target: object, propertyKey: string, index: number, accessor: (data: RouteData, app: IApplicationPart) => any): void {
    ControllerCallbackArgsTag.get(target).add(propertyKey, { index, accessor });
}
