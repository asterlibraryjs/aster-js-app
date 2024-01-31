import { asserts, Constructor } from "@aster-js/core";
import { resolveServiceId } from "@aster-js/ioc";
import { ParamValues, RouteData } from "../routing";
import { ControllerRoutingHandler } from "./controller-routing-handler";
import { ControllerRoutingCallbackArgsTag, ControllerRoutingHandlerTag } from "./controller-routing-handler-tag";

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
 export const RouteValue = (name?: string) => {
    return <ParameterDecorator>function (target: Object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        const accessor = ({ values }: RouteData) => name ? values[name] : structuredClone(values);

        ControllerRoutingCallbackArgsTag.get(target).add(propertyKey, { index, accessor });
    }
}

/** Decorate parameters of controller route calls to inject any values from the query
 * @param name Name of the parameter to reteive and inject the value. If not provided, the value injected the entire QueryValues bag
 */
export const Query = (name?: string) => {
    return <ParameterDecorator>function (target: Object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        const accessor = ({ query }: RouteData) => name ? query[name] : structuredClone(query);

        ControllerRoutingCallbackArgsTag.get(target).add(propertyKey, { index, accessor });
    }
}

/**
 * Decorate parameters of controller route calls to inject any values from the route or the query
 * @param name Name of the parameter to reteive and inject the value. If not provided, the value injected the entire ParamValues bag
 */
export const Param = (name?: string) => {
    return <ParameterDecorator>function (target: Object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        const accessor = ({ values, query }: RouteData) => {
            if (!name) return ParamValues.create(values, query);

            if (Reflect.has(query, name)) return query[name];

            return values[name];
        };

        ControllerRoutingCallbackArgsTag.get(target).add(propertyKey, { index, accessor });
    }
}
