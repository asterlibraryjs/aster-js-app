import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../route-data";
import { IApplicationPart } from "../../abstraction";

export function RouteTemplate(path: string): ClassDecorator {
    return function (target: any) {
        Reflect.defineProperty(target.prototype, "path", { get: () => path });
    }
}

/**
 * Base implementation for any routing handler that use @RouteTemplate decorator to declare its route
 */
export abstract class RoutingHandler implements IRoutingHandler {

    get path(): string { throw new Error("'path' property not define. Use @RouteTemplate('/my-route/')"); }

    abstract handle(data: RouteData, app: IApplicationPart): Promise<void>;
}
