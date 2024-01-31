import { IApplicationPart } from "../abstraction";
import { IRoutingResult } from "./irouting-result";


export enum HtmlInsertionMode {
    replace,
    append,
    prepend
}

/**
 * Returns a routing result used by controllers to do basic alter of the dom
 * @param html Html template
 * @param target Node target
 * @param mode Append mode
 */
export function html(html: string | HTMLElement, target: HTMLElement, mode?: HtmlInsertionMode): IRoutingResult;
/**
 * Returns a routing result used by controllers to do basic alter of the dom
 * @param html Html template
 * @param targetSelector Query selector to call on document
 * @param mode Append mode
 */
export function html(html: string | HTMLElement, targetSelector: string, mode?: HtmlInsertionMode): IRoutingResult
export function html(html: HTMLElement | string, target: HTMLElement | string, mode?: HtmlInsertionMode): IRoutingResult {
    const htmlElement = resolveHtml(html);
    const targetElement = resolveTarget(target);
    return new HtmlResult(targetElement, htmlElement, mode ?? HtmlInsertionMode.replace);
}

function resolveHtml(html: HTMLElement | string) {
    if (typeof html === "string") {
        const container = document.createElement('div');
        container.innerHTML = html;
        return container;
    }
    return html;
}

function resolveTarget(target: HTMLElement | string) {
    if (typeof target === "string") {
        const container = document.querySelector<HTMLElement>(target);
        if (container) return container;

        throw new Error(`Container query selector returns no element: ${target}`)
    }
    return target;
}

class HtmlResult implements IRoutingResult {

    constructor(
        private readonly _target: HTMLElement,
        private readonly _html: HTMLElement,
        private readonly _mode: HtmlInsertionMode
    ) {

    }

    async exec(_app: IApplicationPart): Promise<void> {
        switch (this._mode) {
            case HtmlInsertionMode.append:
                this._target.appendChild(this._html);
                break;
            case HtmlInsertionMode.prepend:
                this._target.insertBefore(this._html, this._target.firstChild);
                break;
            case HtmlInsertionMode.replace:
                this._target.innerHTML = "";
                this._target.appendChild(this._html);
                break;
        }
    }
}
