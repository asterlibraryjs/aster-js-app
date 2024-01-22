import { Route } from "../route";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../routing-invocation-context";
import { IApplicationPart } from "../../abstraction";
import { Tag } from "@aster-js/core";

const tag = Tag<Route>("Route");

export function RouteTemplate(path: string): ClassDecorator {
    return function (target: any) {
        const route = Route.parse(path);
        tag.set(target.prototype, route);
    }
}

/**
 * Base implementation for any routing handler that use @RouteTemplate decorator to declare its route
 */
export abstract class RoutingHandler implements IRoutingHandler {

    get route(): Route {
        if (!tag.has(this)) throw new Error("Route not define. Use @RouteTemplate('/my-route/')");
        return tag.get(this);
    }

    abstract handle(data: RouteData, app: IApplicationPart): Promise<void>;
}
