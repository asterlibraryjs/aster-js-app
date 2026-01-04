import { Lookup } from "@aster-js/collections";
import { Tag } from "@aster-js/core";
import { RouteData } from "../routing";
import {IApplicationPart} from "../abstraction";
import { ControllerRoute } from "./controller-route";

export type ControllerRouteValueAccessor = (data: RouteData, app: IApplicationPart) => any;

/**
 * Represents a parameter of a controller route.
 * The parameter is an argument of the controller method invoked.
 * The accessor allows for the value coming from multiple sources like route, query, ambient value, etc.
 */
export type ControllerRouteParam = {
    readonly index: number;
    readonly accessor: ControllerRouteValueAccessor;
}

export namespace ControllerRouteParam {
    const ControllerCallbackArgsTag = Tag.lazy<Lookup<string, ControllerRouteParam>>("route args", () => new Lookup());

    export function add(target: object, propertyKey: string, index: number, accessor: ControllerRouteValueAccessor): void {
        ControllerCallbackArgsTag.get(target).add(propertyKey, {index, accessor});
    }

    export function resolveValues<T>(controller: T, propertyKey: string, data: RouteData, app: IApplicationPart){
        const proto = Object.getPrototypeOf(controller);

        const routesParams = ControllerCallbackArgsTag.get(proto);
        return [...routesParams.get(propertyKey)]
            .reverse()
            .map(x => x.accessor(data, app));
    }
}
