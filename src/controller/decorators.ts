import { asserts, Constructor } from "@aster-js/core";
import { RouteData, UrlValues } from "../routing";
import { ControllerRouteParam } from "./controller-route-param";
import { IApplicationPart } from "../abstraction";
import { IAmbientValues } from "../routing/abstraction/iambient-values";
import { ControllerConfigTag } from "./controller-config-tag";
import { ControllerRoute } from "./controller-route";

/** Optional, configure a controller */
export const Controller = (baseRoute: string = "/") => {
    return <ClassDecorator>function(target) {
        ControllerConfigTag.set(target, { baseRoute: baseRoute });
    }
}

/** Decorate to enable binding route template to controller method call */
export const RoutePath = (path: string) => {
    return <MethodDecorator>function (target, propertyKey, descriptor) {
        asserts.ofType(propertyKey, "string");

        const callback = <any>descriptor.value;
        if (typeof callback !== "function") throw new Error();
        ControllerRoute.add(path, <Constructor>target.constructor, propertyKey, callback);
    }
}


/** Decorate parameters of controller route calls to inject any values from the route
 * @param name Name of the parameter to retrieve and inject the value. If not provided, the value injected the entire RouteValues bag
 */
export const FromRoute = (name?: string) => {
    return <ParameterDecorator>function (target: object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        const accessor = ({ values }: RouteData) => name ? values[name] : structuredClone(values);

        ControllerRouteParam.add(target, propertyKey, index, accessor);
    }
}

/** Decorate parameters of controller route calls to inject any values from the query
 * @param name Name of the parameter to retrieve and inject the value. If not provided, the value injected the entire QueryValues bag
 */
export const FromSearch = (name?: string) => {
    return <ParameterDecorator>function (target: object, propertyKey: string | symbol, index: number) {
        asserts.ofType(propertyKey, "string");

        function accessor({ query }: RouteData, app: IApplicationPart) {
            if (name) return query[name];

            const result = structuredClone(query);
            const ambientValues = app.services.get(IAmbientValues, true).values;

            return Object.assign(result, ambientValues);
        }
        ControllerRouteParam.add(target, propertyKey, index, accessor);
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
            const ambientValues = app.services.get(IAmbientValues, true);

            if (!name) return UrlValues.create(values, query, ambientValues.values);

            if (Reflect.has(ambientValues.values, name)) return structuredClone(ambientValues.values[name]);

            if (Reflect.has(query, name)) return structuredClone(query[name]);

            return values[name];
        };

        ControllerRouteParam.add(target, propertyKey, index, accessor);
    }
}
