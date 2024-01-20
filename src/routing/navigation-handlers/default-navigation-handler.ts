import { ServiceContract } from "@aster-js/ioc";
import { INavigationHandler } from "../inavigation-handler";

import { IRouter } from "../irouter";

@ServiceContract(INavigationHandler)
export class DefaultNavigationHandler implements INavigationHandler {

    constructor(
        @IRouter private readonly _router: IRouter
    ) { }

    start(): void {
        this._router.eval(location.href);
    }

    stop(): void { }
}
