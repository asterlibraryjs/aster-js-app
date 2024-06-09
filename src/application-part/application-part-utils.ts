import { ServiceIdentity } from "@aster-js/ioc";
import { asserts } from "@aster-js/core";
import { IApplicationPart } from "../abstraction";
import { Route } from "../routing/route";
import { IPartRouteData } from "../routing/abstraction/ipart-route-data";

export type ApplicationPartOptions = {
    readonly includeSelf?: boolean;
    readonly nested?: boolean;
}

export namespace ApplicationPartUtils {
    /**
     * Scan all the downstream hierarchy to return all implementations instance of the specified service.
     * @param svc Service to scan
     * @param includeSelf Include the current service in the scan
     * @param nested Indicate whether or not it should return nested children or only direct children
     */
    export function* scanActiveChildren<T>(svc: T, { includeSelf, nested }: ApplicationPartOptions = {}): Iterable<[Route, IApplicationPart, T]> {
        const identity = ServiceIdentity.get(svc);

        asserts.ensure(identity, "Service must have an identity");

        const app = identity.owner.get(IApplicationPart, true);
        const routeData = app.services.get(IPartRouteData, false);
        if (includeSelf && routeData) yield [routeData.route, app, svc];

        let { activeChild, activeRoute } = app;
        while (activeRoute && activeChild) {
            for (const found of activeChild.services.getAll(identity.desc.serviceId, true)) {
                yield [activeRoute, activeChild, found];
            }

            if (!nested) break;

            activeChild = activeChild.activeChild;
            activeRoute = activeChild?.activeRoute;
        }
    }
}
