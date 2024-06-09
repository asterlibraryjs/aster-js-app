import { ServiceContract } from "@aster-js/ioc";
import { IApplicationPartLifecycle, ApplicationPartLifecycleHooks } from "../../application-part/iapplication-part-lifecycle";

import { IRouter } from "../abstraction/irouter";

@ServiceContract(IApplicationPartLifecycle)
export class DefaultNavigationHandler {
    private readonly _self: this;

    constructor(
        private readonly _location: Location,
        @IRouter private readonly _router: IRouter
    ) {
        this._self = this;
    }

    [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        return Promise.resolve();
    }

    async [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        await this._self._router.eval(this._location.href);
        return Promise.resolve();
    }

    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        return Promise.resolve();
    }
}
