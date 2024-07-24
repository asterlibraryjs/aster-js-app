import { Constructor } from "@aster-js/core";
import { Options, ServiceContract } from "@aster-js/ioc";

import { IAppConfigureHandler } from "../../abstraction/iapp-configure-handler";

import { IRoutingHandler } from "../abstraction/irouting-handler";
import { RoutingOptions } from "../routing-options";
import { RoutingInvocationContext } from "../routing-invocation-context";

@ServiceContract(IRoutingHandler)
export class PartLoaderRoutingHandler implements IRoutingHandler {

    constructor(
        readonly path: string,
        private readonly _configHandler: Constructor<IAppConfigureHandler>,
        @Options(RoutingOptions) private readonly _options: RoutingOptions
    ) { }

    async handle({ data, app }: RoutingInvocationContext): Promise<void> {
        const appName = data.values[this._options.partRouteValueName];
        if (typeof appName !== "string") throw new Error(`Missing route value named 'part'`);

        await app.load(appName, data.route, this._configHandler);
    }
}
