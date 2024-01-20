import { ServiceContract } from "@aster-js/ioc";
import { INavigationHandler } from "../inavigation-handler";

import { IRouter } from "../irouter";
import { IDisposable } from "@aster-js/core";
import { dom } from "@aster-js/dom";

@ServiceContract(INavigationHandler)
export class HistoryNavigationHandler implements INavigationHandler, IDisposable {
    private _popstateHandle?: IDisposable;

    constructor(
        @IRouter private readonly _router: IRouter
    ) { }

    start(): void {
        this._popstateHandle = dom.on(window, "popstate", this.onNavigate);
    }

    private onNavigate(ev: PopStateEvent): void {
        this._router.eval(location.href, ev.state);
    }

    stop(): void {
        IDisposable.safeDispose(this._popstateHandle)
    }

    [Symbol.dispose](): void {
        this.stop();
    }
}
