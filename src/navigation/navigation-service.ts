import { ServiceContract, AllParentServices } from "@aster-js/ioc";
import { IContainerRouteData, IRouter } from "../routing";
import { IApplicationPart } from "../abstraction";
import { RoutingConstants } from "../routing/routing-constants";
import { INavigationService } from "./inavigation-service";
import { Query } from "@aster-js/iterators";
import { Path } from "../routing/path";

@ServiceContract(INavigationService)
export class DefaultNavigationService implements INavigationService {

    constructor(
        @IRouter private readonly _router: IRouter,
        @IApplicationPart private readonly _application: IApplicationPart
    ) { }

    async navigate(relativeUrl: string, replace: boolean = false): Promise<void> {
        const isRelative = relativeUrl.startsWith(RoutingConstants.RELATIVE_CHAR);

        const coercedUrl = isRelative ? RoutingConstants.RELATIVE_URL_CHAR + relativeUrl.substring(1) : relativeUrl;
        const baseAddress = this.getBaseAddress(isRelative);
        const url = new URL(coercedUrl, baseAddress);

        if (replace) {
            history.replaceState({}, "", url);
        }
        else {
            history.pushState({}, "", url);
        }
        await this._router.eval(relativeUrl);
    }

    private getBaseAddress(isRelative: boolean): URL {
        if (isRelative) {
            const all = AllParentServices(IContainerRouteData, this._application, false);
            const segments = Query(all)
                .map(x => x.path)
                .toArray()
                .reverse();
            return new URL(Path.join(segments), location.origin);
        }
        return new URL(location.href);
    }
}
