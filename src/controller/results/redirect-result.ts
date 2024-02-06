import { IApplicationPart } from "../../abstraction";
import { INavigationService } from "../../navigation";
import { IRoutingResult } from "../irouting-result";

/**
 * Redirects to a new url using navigation service
 * @param url Url to redirect
 */
export function redirectResult(url: string): IRoutingResult {
    return new RedirectResult(url);
}

class RedirectResult implements IRoutingResult {
    constructor(
        private readonly _url: string
    ) { }

    async exec(app: IApplicationPart): Promise<void> {
        const nav = app.services.get(INavigationService, true);
        await nav.navigate(this._url);
    }
}
