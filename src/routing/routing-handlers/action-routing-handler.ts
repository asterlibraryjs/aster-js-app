import { ServiceContract } from "@aster-js/ioc";
import { Route } from "../route";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData, RoutingInvocationContext } from "../routing-invocation-context";
import { IApplicationPart } from "../../abstraction";

export type RouterAction = (ctx: RoutingInvocationContext) => Promise<void> | void;

@ServiceContract(IRoutingHandler)
export class ActionRoutingHandler implements IRoutingHandler {
    private readonly _route: Route;
    private readonly _action: RouterAction;

    get route(): Route { return this._route; }

    constructor(path: string, action: RouterAction) {
        this._route = Route.parse(path);
        this._action = action;
    }

    handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const result = this._action({ data, app, route: this.route });
        if(result instanceof Promise) return result;
        return Promise.resolve();
    }
}
