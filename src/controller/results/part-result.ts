import { Constructor } from "@aster-js/core";
import { AppConfigureDelegate, IAppConfigureHandler, IApplicationPart } from "../../abstraction";
import { IRoutingResult } from "../irouting-result";
import { IContainerRouteData } from "../../routing";

/**
 * Load an application part with the given name and configuration.
 * @param name Name of the part
 * @param configure Callback or configure handler to configure the part
 * @returns A new result to load the part
 */
export function partResult(name: string, configure: Constructor<IAppConfigureHandler> | AppConfigureDelegate): IRoutingResult {
    return new PartResult(name, configure);
}

class PartResult implements IRoutingResult {

    constructor(
        private readonly _name: string,
        private readonly _configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate
    ) {    }

    async exec(app: IApplicationPart): Promise<void> {
        const containerRouteData = app.services.get(IContainerRouteData, true);
        await app.load(this._name, containerRouteData.route, this._configHandler);
    }
}
