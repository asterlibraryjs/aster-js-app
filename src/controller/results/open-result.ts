import { IApplicationPart } from "../../abstraction";
import { INavigationService } from "../../navigation";
import { IRoutingResult } from "../irouting-result";

export type OpenWindowOptions = {
    readonly popup?: boolean;
    readonly width?: number;
    readonly height?: number;
    readonly left?: number;
    readonly top?: number;
    readonly scrollbars?: boolean;
    readonly noopener?: boolean;
    readonly noreferrer?: boolean;
}

/**
 * Redirects to a new url using navigation service
 * @param url Url to redirect
 * @param target Target window
 */
export function openResult(url: string, target: string = "_blank", features: OpenWindowOptions = {}): IRoutingResult {
    return new OpenResult(url, target, features);
}

class OpenResult implements IRoutingResult {
    constructor(
        private readonly _url: string,
        private readonly _target: string,
        private readonly features: OpenWindowOptions
    ) { }

    async exec(app: IApplicationPart): Promise<void> {
        const features = Object.entries(this.features).map(([key, value]) => `${key}=${value}`).join(",");
        window.open(this._url, "_self")
    }
}
