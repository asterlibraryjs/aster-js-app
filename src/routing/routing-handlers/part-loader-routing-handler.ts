import { ServiceContract } from "@aster-js/ioc";
import { Route } from "../route";
import { IRoutingHandler } from "../irouting-handler";
import { RouteData } from "../routing-invocation-context";
import { IAppConfigureHandler, IApplicationPart } from "../../abstraction";
import { Constructor } from "@aster-js/core";

@ServiceContract(IRoutingHandler)
export class PartLoaderRoutingHandler implements IRoutingHandler {
    private readonly _route: Route;

    get path(): string { return this._path; }

    get route(): Route { return this._route; }

    constructor(
        private readonly _path: string,
        private readonly _configHandler: Constructor<IAppConfigureHandler>
    ) {
        this._route = Route.parse(_path);
    }

    async handle(data: RouteData, app: IApplicationPart): Promise<void> {
        const appName = data.values["app"];
        if (typeof appName !== "string") throw new Error(`Missing route value named 'app'`);
        await app.load(appName, this._configHandler);
    }
}
