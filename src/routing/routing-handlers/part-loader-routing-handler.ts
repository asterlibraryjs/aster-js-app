import { ServiceContract } from "@aster-js/ioc";
import { Route } from "../route";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../route-data";
import { IAppConfigureHandler, IApplicationPart } from "../../abstraction";
import { Constructor } from "@aster-js/core";
import { IRouteParser } from "../iroute-parser";

@ServiceContract(IRoutingHandler)
export class PartLoaderRoutingHandler implements IRoutingHandler {

    constructor(
        readonly path: string,
        private readonly _configHandler: Constructor<IAppConfigureHandler>
    ) {    }

    async handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const appName = data.values["part"];
        if (typeof appName !== "string") throw new Error(`Missing route value named 'part'`);
        await app.load(appName, this._configHandler);
    }
}
