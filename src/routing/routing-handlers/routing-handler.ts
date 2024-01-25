import { Route } from "../route";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../routing-invocation-context";
import { IApplicationPart } from "../../abstraction";


export function RouteTemplate(path: string): ClassDecorator {
    const route = Route.parse(path);
    return function (target: any) {
        Reflect.defineProperty(target.prototype, "route", { get: () => route });
        Reflect.defineProperty(target.prototype, "path", { get: () => path });
    }
}
const errorMessage = " not define. Use @RouteTemplate('name', '/my-route/')";
/**
 * Base implementation for any routing handler that use @RouteTemplate decorator to declare its route
 */
export abstract class RoutingHandler implements IRoutingHandler {

    get path(): string { throw new Error("path" + errorMessage); }

    get route(): Route { throw new Error("route" + errorMessage); }

    abstract handle(data: RouteData, app: IApplicationPart): Promise<void>;
}
