import { ServiceContract, AllParentServices } from "@aster-js/ioc";
import { IContainerRouteData, IRouter } from "../routing";
import { IApplicationPart } from "../abstraction";
import { RoutingConstants } from "../routing/routing-constants";
import { INavigationService } from "./inavigation-service";
import { Query } from "@aster-js/iterators";

@ServiceContract(INavigationService)
export class DefaultNavigationService implements INavigationService {

    constructor(
        @IRouter private readonly _router: IRouter,
        @IApplicationPart private readonly _application: IApplicationPart
    ) { }

    async navigate(relativeUrl: string, replace: boolean = false): Promise<void> {
        const isRelative = relativeUrl.startsWith(RoutingConstants.RELATIVE_CHAR);
        if (isRelative) {
            relativeUrl = RoutingConstants.RELATIVE_URL_CHAR + relativeUrl.substring(1);
        }

        const baseAddress = this.getBaseAddress(isRelative);
        const url = new URL(relativeUrl, baseAddress);

        if (replace) {
            history.replaceState({}, "", url);
        }
        else {
            history.pushState({}, "", url);
        }
        await this._router.eval(relativeUrl);
    }

    private getBaseAddress(isRelative: boolean): string {
        if (isRelative) {
            const all = AllParentServices(IContainerRouteData, this._application, false);
            const path = RoutingConstants.SEGMENT_SEPARATOR + Query(all)
                .map(x => x.getUrlSegment())
                .toArray()
                .join(RoutingConstants.SEGMENT_SEPARATOR)
                + RoutingConstants.SEGMENT_SEPARATOR;

            const url = new URL(path, location.origin);
            return url.href;
        }
        return location.href;
    }
}
