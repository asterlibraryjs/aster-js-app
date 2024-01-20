import { IDisposable } from "@aster-js/core";
import { dom } from "@aster-js/dom";
import { ServiceContract } from "@aster-js/ioc";
import { INavigationHandler } from "../inavigation-handler";

import { IRouter } from "../irouter";

@ServiceContract(INavigationHandler)
export class HyperlinkNavigationHandler implements INavigationHandler, IDisposable {
    private _registration?: IDisposable;

    constructor(
        @IRouter private readonly _router: IRouter
    ) { }

    start(): void {
        if (this._registration) return;

        this._registration = dom.on(document.body, "click", ev => this.onRootClick(<UIEvent>ev));
    }

    private onRootClick(ev: UIEvent): void {
        const anchor = this.findAnchor(ev);
        if (anchor) {
            const url = new URL(anchor.href, location.href);
            if (url.origin === location.origin) {
                const result = this._router.eval(url.pathname);
                if (result !== false) {
                    ev.preventDefault();
                }
            }
        }
    }

    private findAnchor(ev: UIEvent): HTMLAnchorElement | undefined {
        for (const item of ev.composedPath()) {
            if (item instanceof HTMLAnchorElement) return item;
        }
    }

    stop(): void {
        IDisposable.safeDispose(this._registration);
        this._registration;
    }

    [Symbol.dispose](): void {
        this.stop();
    }
}
