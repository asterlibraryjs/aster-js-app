import { Func } from "@aster-js/core"
import { ServiceIdentifier } from "@aster-js/ioc";
import { IRoutingHandler, RouteData, RoutingInvocationContext } from "../routing";
import { ControllerCallbackArgsTag } from "./controller-routing-handler-tag";
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
    ) { }

    async handle({ data, app }: RoutingInvocationContext): Promise<void> {
        const controller = app.services.get(this._target, true);

        const proto = Object.getPrototypeOf(controller);
        const argsDefinition = ControllerCallbackArgsTag.get(proto);
        const args = [...argsDefinition.get(this._methodName)]
            .reverse()
            .map(x => x.accessor(data, app));

        let result = this._callback.apply(controller, args);

        if (result instanceof Promise) {
            result = await result;
        }
        if (result) {
            await result.exec(app);
        }
    }
}
