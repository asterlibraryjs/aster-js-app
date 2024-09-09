import { ServiceContract } from "@aster-js/ioc";
import { IRouter } from "../routing";
import { INavigationService } from "./inavigation-service";

@ServiceContract(INavigationService)
export class DefaultNavigationService implements INavigationService {

    constructor(
        @IRouter private readonly _router: IRouter
    ) { }

    async navigate(relativeUrl: string, replace: boolean = false): Promise<void> {
        const result = await this._router.eval(relativeUrl);
        if (result.success) {
            const url = new URL(result.relativeUrl, location.origin);

            if (replace) {
                history.replaceState({}, "", url);
            }
            else {
                history.pushState({}, "", url);
            }
        }
        else {
            throw new Error(result.reason);
        }
    }
}
