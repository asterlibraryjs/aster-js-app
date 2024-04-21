import { ServiceContract } from "@aster-js/ioc";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../route-data";
import { IAppConfigureHandler, IApplicationPart } from "../../abstraction";
import { Constructor } from "@aster-js/core";

const routeName = "part";

@ServiceContract(IRoutingHandler)
export class PartLoaderRoutingHandler implements IRoutingHandler {

    constructor(
        readonly path: string,
        private readonly _configHandler: Constructor<IAppConfigureHandler>
    ) { }

    async handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const appName = data.values[routeName];
        if (typeof appName !== "string") throw new Error(`Missing route value named 'part'`);

        await app.load(appName, data.route, this._configHandler);
    }
}
