import { IRoutingHandler, RoutingInvocationContext } from "../routing";
import { ControllerRouteParam } from "./controller-route-param";
import { ControllerRoute } from "./controller-route";
import { ControllerRoutingResult } from "./controller-routing-result";

/**
 * Routing handler used by controllers
 */
export class ControllerRoutingHandler implements IRoutingHandler {
    constructor(
        readonly path: string,
        private readonly _route: ControllerRoute
    ) { }

    async handle({ data, app }: RoutingInvocationContext): Promise<void> {
        const controller = app.services.get(this._route.serviceId, true);

        const args = ControllerRouteParam.resolveValues(controller, this._route.propertyKey, data, app);

        let result = this._route.callback.apply(controller, args);
        await ControllerRoutingResult.exec(result, app);
    }
}
