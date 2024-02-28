import { Func } from "@aster-js/core"
import { ServiceIdentifier } from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction";
import { IRoutingHandler, RouteData } from "../routing";
import { ControllerRoutingCallbackArgsTag } from "./controller-routing-handler-tag";
import type { IRoutingResult } from "./irouting-result";

/**
 * Routing handler used by controllers
 */
export class ControllerRoutingHandler implements IRoutingHandler {
    constructor(
        readonly path: string,
        private readonly _methodName: string,
        private readonly _target: ServiceIdentifier,
        private readonly _callback: Func<any[], Promise<IRoutingResult> | IRoutingResult>
    ) {    }

    async handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const controller = app.services.get(this._target, true);

        const proto = Object.getPrototypeOf(controller);
        const argsDefinition = ControllerRoutingCallbackArgsTag.get(proto);
        const args = [...argsDefinition.get(this._methodName)].reverse().map(x => x.accessor(data));

        const result = await this._callback.apply(controller, args);
        await result.exec(app);
    }
}
