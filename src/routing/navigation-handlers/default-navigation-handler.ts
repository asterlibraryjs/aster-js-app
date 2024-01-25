import { ServiceContract } from "@aster-js/ioc";
import { IApplicationPart } from "../../abstraction";
import { IApplicationPartLifecycle, ApplicationPartLifecycleHooks } from "../../application-part/iapplication-part-lifecycle";

import { IRouter } from "../irouter";

@ServiceContract(IApplicationPartLifecycle)
export class DefaultNavigationHandler {
    private readonly _self: this;
    constructor(
        @IRouter private readonly _router: IRouter
    ) {
        this._self = this;
    }

    async [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        await this._self._router.eval(location.href);
        return Promise.resolve();
    }

    [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        return Promise.resolve();
    }

    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        return Promise.resolve();
    }
}
