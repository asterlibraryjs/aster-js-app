import { IDisposable } from "@aster-js/core";
import { dom } from "@aster-js/dom";
import { Options, ServiceContract } from "@aster-js/ioc";
import { IApplicationPartLifecycle, ApplicationPartLifecycleHooks } from "../../application-part/iapplication-part-lifecycle";
import { IRouter } from "../irouter";
import { RoutingOptions } from "../routing-options";

@ServiceContract(IApplicationPartLifecycle)
export class HyperlinkNavigationHandler implements IDisposable {
    private _registration?: IDisposable;

    constructor(
        @Options(RoutingOptions) private readonly _options: RoutingOptions,
        @IRouter private readonly _router: IRouter
    ) { }

    [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        return Promise.resolve();
    }

    [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        if (typeof this._registration === "undefined") {
            this._registration = dom.on(document.body, "click", ev => this.onRootClick(<UIEvent>ev));
        }
        return Promise.resolve();
    }

    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        IDisposable.safeDispose(this._registration);
        delete this._registration;

        return Promise.resolve();
    }

    private onRootClick(ev: UIEvent): void {
        const anchor = this.findAnchor(ev);
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (!href) return;

        const url = new URL(href, location.href);
        if (location.origin !== url.origin) return;

        ev.preventDefault();
        ev.stopPropagation();

        if (location.href === url.href) return;

        this.navigate(url, anchor.innerText);
    }

    private async navigate(url: URL, title: string): Promise<void> {
        if (await this._router.eval(url.pathname)) {
            history.pushState({}, title, url);
        }
        else if (!this._options.assignLocationForUnhandled) {
            location.assign(url);
        }
    }

    private findAnchor(ev: UIEvent): HTMLElement | undefined {
        for (const item of ev.composedPath()) {
            if (item instanceof HTMLElement
                && item.matches(this._options.linkTagSelectors)) {
                return item as HTMLElement;
            }
        }
    }

    [Symbol.dispose](): void {
        IDisposable.safeDispose(this._registration);
    }
}
