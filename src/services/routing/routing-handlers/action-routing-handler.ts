import { ServiceContract } from "@aster-js/ioc";
import { Route } from "../iroute-segment";
import { IRoutingHandler, RouterAction } from "../irouting-handler";
import { RouteValues } from "../routing-invocation-context";
import { IApplicationPart } from "src/services/abstraction";


@ServiceContract(IRoutingHandler)
export class ActionRoutingHandler implements IRoutingHandler {
    private readonly _route: Route;
    private readonly _action: RouterAction;

    get route(): Route { return this._route; }

    constructor(path: string, action: RouterAction) {
        this._route = Route.parse(path);
        this._action = action;
    }

    handle(values: RouteValues, app: IApplicationPart): Promise<void> {
        const result = this._action({ values, app, route: this.route });
        if(result instanceof Promise) return result;
        return Promise.resolve();
    }
}
