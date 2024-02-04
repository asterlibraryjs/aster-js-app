import { ServiceContract } from "@aster-js/ioc";
import { IApplicationPartLifecycle, ApplicationPartLifecycleHooks } from "../../application-part/iapplication-part-lifecycle";

import { IRouter } from "../irouter";
import { IDisposable } from "@aster-js/core";
import { dom } from "@aster-js/dom";

@ServiceContract(IApplicationPartLifecycle)
export class HistoryNavigationHandler implements IDisposable {
    private _popstateHandle?: IDisposable;

    constructor(
        @IRouter private readonly _router: IRouter
    ) { }

    [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        return Promise.resolve();
    }

    [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        if (typeof this._popstateHandle === "undefined") {
            this._popstateHandle = dom.on(window, "popstate", ev => this.onNavigate(<PopStateEvent>ev));
        }
        return Promise.resolve();
    }

    private onNavigate(ev: PopStateEvent): void {
        this._router.eval(location.href, ev.state);
    }

    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        IDisposable.safeDispose(this._popstateHandle);
        delete this._popstateHandle;
        return Promise.resolve();
    }

    [Symbol.dispose](): void {
        IDisposable.safeDispose(this._popstateHandle);
    }
}
