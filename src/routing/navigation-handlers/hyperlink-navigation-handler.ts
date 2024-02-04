import { IDisposable } from "@aster-js/core";
import { dom } from "@aster-js/dom";
import { Options, ServiceContract } from "@aster-js/ioc";
import { IApplicationPartLifecycle, ApplicationPartLifecycleHooks } from "../../application-part/iapplication-part-lifecycle";
import { IRouter } from "../irouter";
import { NavigationHandlerOptions } from "./navigation-handler-options";

@ServiceContract(IApplicationPartLifecycle)
export class HyperlinkNavigationHandler implements IDisposable {
    private _registration?: IDisposable;

    constructor(
        @Options(NavigationHandlerOptions) private readonly _options: NavigationHandlerOptions,
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

        const url = new URL(anchor.href, location.href);
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
        else if (!this._options.disableAssignLocationForUnhandled) {
            location.assign(url);
        }
    }

    private findAnchor(ev: UIEvent): HTMLAnchorElement | undefined {
        if (this._options.additionalLinkTagSelectors) {
            for (const item of ev.composedPath()) {
                if (item instanceof HTMLAnchorElement) return item;

                if (item instanceof HTMLElement
                    && item.matches(this._options.additionalLinkTagSelectors)) {
                    return item as HTMLAnchorElement;
                }
            }
        }
        else {
            for (const item of ev.composedPath()) {
                if (item instanceof HTMLAnchorElement) return item;
            }
        }
    }

    [Symbol.dispose](): void {
        IDisposable.safeDispose(this._registration);
    }
}
